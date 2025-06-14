const { ChatAIActions } = require('./main/helpers/ai/actions/chat-ai.actions')

// Mock content để test
const mockContent = {
    title: 'Python Program to Check if a Number is Odd or Even',
    description: 'Write a Python Program to check whether a given number is even or odd.',
    methods: [
        {
            name: 'Method 1',
            description: 'In this approach, we check whether a number is even or odd using if-else statement and modulus operator.',
            sourceCode: `n = int(input("Enter a number: "))
 
if n % 2 == 0:
    print(n, "is an even number.")
else:
    print(n, "is an odd number.")`,
            explanation: 'This method uses modulus operator to check remainder.',
            testCases: ['Input: 4\nOutput: 4 is an even number.', 'Input: 7\nOutput: 7 is an odd number.'],
            complexity: 'Time Complexity: O(1)\nSpace Complexity: O(1)'
        }
    ],
    solutions: [],
    testCases: [],
    url: 'https://www.sanfoundry.com/python-program-determine-even-odd-recursively/'
}

const aiOptions = {
    templateType: 'exercise',
    useStream: false,
    policy: 'balanced'
}

async function testAI() {
    console.log('🧪 Testing AI processing...')

    const aiActions = new ChatAIActions()

    try {
        const result = await aiActions.processContent(mockContent, aiOptions)

        console.log('📊 AI Result:')
        console.log('Success:', result.success)
        console.log('Processing time:', result.processingTime, 'ms')
        console.log('Data length:', result.data?.length || 0)
        console.log('Metadata:', result.metadata)

        if (result.success && result.data) {
            console.log('\n📝 Generated content preview:')
            console.log(result.data.substring(0, 500) + '...')

            // Kiểm tra các yếu tố quan trọng
            const checks = {
                'Tiêu đề tiếng Việt': result.data.includes('Chương trình Python kiểm tra số chẵn lẻ'),
                'Đề bài tiếng Việt': result.data.includes('Viết chương trình Python kiểm tra'),
                'Test Cases section': result.data.includes('## 🧪 Test Cases'),
                'Code section': result.data.includes('## 💻 Code và Giải thích'),
                'Brand info': result.data.includes('Nguyễn Phương Anh Tú')
            }

            console.log('\n✅ Quality checks:')
            Object.entries(checks).forEach(([check, passed]) => {
                console.log(`${passed ? '✅' : '❌'} ${check}`)
            })
        } else {
            console.log('❌ AI processing failed:', result.error)
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message)
    }
}

testAI() 