#!/usr/bin/env python3
"""
File and Directory Batch Renaming Tool
Công cụ đổi tên hàng loạt file và thư mục

Usage:
    python rename.py -p /path/to/directory -o "old_pattern" -n "new_pattern" -m file
    python rename.py -p /path/to/directory -o "old_pattern" -n "new_pattern" -m directory
    python rename.py -- -p /path/to/directory -o "-pattern-" -n "new_pattern" -m file
"""

import os
import re
import argparse
import sys
from pathlib import Path
from typing import List, Tuple, Optional


class FileRenamer:
    """Class để xử lý việc đổi tên file và thư mục"""

    def __init__(self, base_path: str, old_pattern: str, new_pattern: str,
                 mode: str = "file", dry_run: bool = False, case_sensitive: bool = True):
        self.base_path = Path(base_path)
        self.old_pattern = old_pattern
        self.new_pattern = new_pattern
        self.mode = mode.lower()
        self.dry_run = dry_run
        self.case_sensitive = case_sensitive

        # Validate inputs
        if not self.base_path.exists():
            raise FileNotFoundError(f"Đường dẫn không tồn tại: {base_path}")

        if not self.base_path.is_dir():
            raise NotADirectoryError(f"Đường dẫn phải là thư mục: {base_path}")

        if self.mode not in ["file", "directory", "both"]:
            raise ValueError("Mode phải là 'file', 'directory', hoặc 'both'")

    def get_replacement_text(self, original_name: str) -> str:
        """Thay thế pattern trong tên file/thư mục"""
        if self.case_sensitive:
            return original_name.replace(self.old_pattern, self.new_pattern)
        else:
            # Case-insensitive replacement
            pattern = re.compile(re.escape(self.old_pattern), re.IGNORECASE)
            return pattern.sub(self.new_pattern, original_name)

    def find_files_to_rename(self) -> List[Tuple[Path, str]]:
        """Tìm tất cả file cần đổi tên"""
        files_to_rename = []

        for root, dirs, files in os.walk(self.base_path):
            root_path = Path(root)

            for file_name in files:
                if self.old_pattern in file_name or (
                    not self.case_sensitive and
                    self.old_pattern.lower() in file_name.lower()
                ):
                    old_path = root_path / file_name
                    new_name = self.get_replacement_text(file_name)
                    files_to_rename.append((old_path, new_name))

        return files_to_rename

    def find_directories_to_rename(self) -> List[Tuple[Path, str]]:
        """Tìm tất cả thư mục cần đổi tên"""
        dirs_to_rename = []

        # Sắp xếp theo độ sâu giảm dần để đổi tên từ trong ra ngoài
        all_dirs = []
        for root, dirs, files in os.walk(self.base_path):
            for dir_name in dirs:
                dir_path = Path(root) / dir_name
                depth = len(dir_path.parts)
                all_dirs.append((depth, dir_path, dir_name))

        # Sắp xếp theo độ sâu giảm dần
        all_dirs.sort(key=lambda x: x[0], reverse=True)

        for depth, dir_path, dir_name in all_dirs:
            if self.old_pattern in dir_name or (
                not self.case_sensitive and
                self.old_pattern.lower() in dir_name.lower()
            ):
                new_name = self.get_replacement_text(dir_name)
                dirs_to_rename.append((dir_path, new_name))

        return dirs_to_rename

    def preview_changes(self) -> None:
        """Preview những thay đổi sẽ được thực hiện"""
        print(f"\n📋 PREVIEW - Những thay đổi sẽ được thực hiện:")
        print(f"📁 Thư mục gốc: {self.base_path}")
        print(f"🔍 Tìm kiếm: '{self.old_pattern}'")
        print(f"🔄 Thay thế bằng: '{self.new_pattern}'")
        print(f"🎯 Chế độ: {self.mode}")
        print(f"🔠 Case sensitive: {self.case_sensitive}")
        print("=" * 70)

        total_changes = 0

        if self.mode in ["file", "both"]:
            files_to_rename = self.find_files_to_rename()
            if files_to_rename:
                print(f"\n📄 FILES ({len(files_to_rename)} file):")
                for old_path, new_name in files_to_rename:
                    print(f"  📄 {old_path.name} → {new_name}")
                    print(f"     📍 {old_path.parent}")
                total_changes += len(files_to_rename)

        if self.mode in ["directory", "both"]:
            dirs_to_rename = self.find_directories_to_rename()
            if dirs_to_rename:
                print(f"\n📁 DIRECTORIES ({len(dirs_to_rename)} thư mục):")
                for old_path, new_name in dirs_to_rename:
                    print(f"  📁 {old_path.name} → {new_name}")
                    print(f"     📍 {old_path.parent}")
                total_changes += len(dirs_to_rename)

        if total_changes == 0:
            print(
                f"\n❌ Không tìm thấy file hoặc thư mục nào chứa pattern '{self.old_pattern}'")
        else:
            print(f"\n📊 Tổng cộng: {total_changes} thay đổi")

    def rename_files(self) -> int:
        """Đổi tên files"""
        files_to_rename = self.find_files_to_rename()
        success_count = 0

        for old_path, new_name in files_to_rename:
            try:
                new_path = old_path.parent / new_name

                if new_path.exists() and new_path != old_path:
                    print(
                        f"⚠️  Bỏ qua (file đã tồn tại): {old_path.name} → {new_name}")
                    continue

                if not self.dry_run:
                    old_path.rename(new_path)

                print(f"✅ File: {old_path.name} → {new_name}")
                success_count += 1

            except Exception as e:
                print(f"❌ Lỗi khi đổi tên file {old_path.name}: {e}")

        return success_count

    def rename_directories(self) -> int:
        """Đổi tên directories"""
        dirs_to_rename = self.find_directories_to_rename()
        success_count = 0

        for old_path, new_name in dirs_to_rename:
            try:
                new_path = old_path.parent / new_name

                if new_path.exists() and new_path != old_path:
                    print(
                        f"⚠️  Bỏ qua (thư mục đã tồn tại): {old_path.name} → {new_name}")
                    continue

                if not self.dry_run:
                    old_path.rename(new_path)

                print(f"✅ Directory: {old_path.name} → {new_name}")
                success_count += 1

            except Exception as e:
                print(f"❌ Lỗi khi đổi tên thư mục {old_path.name}: {e}")

        return success_count

    def execute(self) -> None:
        """Thực hiện đổi tên"""
        if self.dry_run:
            print("\n🔍 DRY RUN MODE - Không có thay đổi thực tế nào được thực hiện")

        print(f"\n🚀 BẮT ĐẦU ĐÓỂN TÊN...")

        total_success = 0

        if self.mode in ["file", "both"]:
            print(f"\n📄 Đang đổi tên files...")
            file_success = self.rename_files()
            total_success += file_success
            print(f"📄 Hoàn thành: {file_success} files")

        if self.mode in ["directory", "both"]:
            print(f"\n📁 Đang đổi tên directories...")
            dir_success = self.rename_directories()
            total_success += dir_success
            print(f"📁 Hoàn thành: {dir_success} directories")

        print(f"\n🎉 HOÀN THÀNH! Tổng cộng: {total_success} thay đổi")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="🔄 Công cụ đổi tên hàng loạt file và thư mục",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ sử dụng:
  # Đổi tên tất cả files chứa "old" thành "new"
  python rename.py -p /path/to/dir -o "old" -n "new" -m file
  
  # Đổi tên files với pattern bắt đầu bằng dấu gạch ngang
  python rename.py -p /path/to/dir -o="-c-" -n="-py-" -m file
  
  # Hoặc sử dụng dấu -- để tách biệt
  python rename.py -- -p /path/to/dir -o "-c-" -n "-py-" -m file
  
  # Đổi tên tất cả directories chứa "test" thành "prod"
  python rename.py -p /path/to/dir -o "test" -n "prod" -m directory
  
  # Đổi tên cả files và directories
  python rename.py -p /path/to/dir -o "old" -n "new" -m both
  
  # Preview trước khi thực hiện (dry run)
  python rename.py -p /path/to/dir -o "old" -n "new" -m file --dry-run
  
  # Case-insensitive replacement
  python rename.py -p /path/to/dir -o "OLD" -n "new" -m file --ignore-case
        """
    )

    parser.add_argument(
        "-p", "--path",
        required=True,
        help="📁 Đường dẫn đến thư mục chứa files/directories cần đổi tên"
    )

    parser.add_argument(
        "-o", "--old-pattern",
        required=True,
        help="🔍 Pattern cũ cần tìm và thay thế (sử dụng -o=\"-pattern-\" nếu bắt đầu bằng dấu gạch ngang)"
    )

    parser.add_argument(
        "-n", "--new-pattern",
        required=True,
        help="🔄 Pattern mới để thay thế (sử dụng -n=\"-pattern-\" nếu bắt đầu bằng dấu gạch ngang)"
    )

    parser.add_argument(
        "-m", "--mode",
        choices=["file", "directory", "both"],
        default="file",
        help="🎯 Chế độ đổi tên: file, directory, hoặc both (mặc định: file)"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="🔍 Chỉ preview không thực hiện thay đổi thực tế"
    )

    parser.add_argument(
        "--ignore-case",
        action="store_true",
        help="🔠 Không phân biệt hoa thường khi tìm kiếm"
    )

    parser.add_argument(
        "-y", "--yes",
        action="store_true",
        help="✅ Tự động xác nhận, không hỏi người dùng"
    )

    # Handle the case where patterns start with hyphens
    try:
        args = parser.parse_args()
    except SystemExit as e:
        # If parsing fails, provide helpful error message
        if e.code == 2:  # Argument parsing error
            print(
                "\n❌ Lỗi: Pattern bắt đầu bằng dấu gạch ngang (-) cần được xử lý đặc biệt!")
            print("\n💡 Các cách khắc phục:")
            print(
                "1. Sử dụng dấu = : python rename.py -p path -o=\"-c-\" -n=\"-py-\" -m file")
            print(
                "2. Sử dụng dấu -- : python rename.py -- -p path -o \"-c-\" -n \"-py-\" -m file")
            print(
                "3. Sử dụng quotes: python rename.py -p path -o '\"-c-\"' -n '\"-py-\"' -m file")
            print("\n📖 Xem help để biết thêm chi tiết: python rename.py -h")
        sys.exit(e.code)

    try:
        # Khởi tạo FileRenamer
        renamer = FileRenamer(
            base_path=args.path,
            old_pattern=args.old_pattern,
            new_pattern=args.new_pattern,
            mode=args.mode,
            dry_run=args.dry_run,
            case_sensitive=not args.ignore_case
        )

        # Preview changes
        renamer.preview_changes()

        # Xác nhận từ người dùng
        if not args.dry_run and not args.yes:
            print("\n❓ Bạn có muốn tiếp tục? (y/N): ", end="")
            confirm = input().strip().lower()
            if confirm not in ["y", "yes"]:
                print("❌ Đã hủy bỏ.")
                return

        # Thực hiện đổi tên
        renamer.execute()

    except Exception as e:
        print(f"❌ Lỗi: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
