import { render, screen, fireEvent, waitFor, userEvent } from '../../test-utils'
import { CreateKnowledgeModal } from '@/components/files/CreateKnowledgeModal'
import { knowledgeApi } from '@/lib/api/knowledge'

// Mock the knowledge API
jest.mock('@/lib/api/knowledge', () => ({
  knowledgeApi: {
    create: jest.fn(),
    uploadFile: jest.fn(),
  },
}))

describe('CreateKnowledgeModal', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders the create button by default', () => {
    render(<CreateKnowledgeModal />)
    expect(screen.getByText('新建知识库')).toBeInTheDocument()
  })

  it('renders custom trigger when children are provided', () => {
    render(
      <CreateKnowledgeModal>
        <button>Custom Trigger</button>
      </CreateKnowledgeModal>
    )
    expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
  })

  it('opens modal when trigger is clicked', async () => {
    render(<CreateKnowledgeModal />)
    await userEvent.click(screen.getByText('新建知识库'))
    expect(screen.getByText('创建新知识库')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<CreateKnowledgeModal />)
    
    // Open modal
    await userEvent.click(screen.getByText('新建知识库'))
    
    // Try to submit without filling required fields
    await userEvent.click(screen.getByText('创建'))
    
    // Check for validation message
    expect(await screen.findByText('名称至少2个字符')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const mockKnowledgeBase = {
      id: 'test-id',
      name: 'Test Knowledge Base',
      description: 'Test Description',
    }
    
    // Mock the API response
    ;(knowledgeApi.create as jest.Mock).mockResolvedValueOnce(mockKnowledgeBase)
    
    render(<CreateKnowledgeModal />)
    
    // Open modal
    await userEvent.click(screen.getByText('新建知识库'))
    
    // Fill form
    await userEvent.type(screen.getByPlaceholderText('请输入知识库名称'), 'Test Knowledge Base')
    await userEvent.type(screen.getByPlaceholderText('请输入知识库简介（可选）'), 'Test Description')
    
    // Submit form
    await userEvent.click(screen.getByText('创建'))
    
    // Verify API was called with correct data
    expect(knowledgeApi.create).toHaveBeenCalledWith({
      name: 'Test Knowledge Base',
      description: 'Test Description',
    })
  })

  it('handles API errors', async () => {
    // Mock API error
    ;(knowledgeApi.create as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
    
    render(<CreateKnowledgeModal />)
    
    // Open modal
    await userEvent.click(screen.getByText('新建知识库'))
    
    // Fill form
    await userEvent.type(screen.getByPlaceholderText('请输入知识库名称'), 'Test Knowledge Base')
    
    // Submit form
    await userEvent.click(screen.getByText('创建'))
    
    // Verify error message is displayed
    expect(await screen.findByText('创建失败，请检查名称是否重复')).toBeInTheDocument()
  })

  it('closes modal when cancel is clicked', async () => {
    render(<CreateKnowledgeModal />)
    
    // Open modal
    await userEvent.click(screen.getByText('新建知识库'))
    
    // Click cancel
    await userEvent.click(screen.getByText('取消'))
    
    // Verify modal is closed
    expect(screen.queryByText('创建新知识库')).not.toBeInTheDocument()
  })
}) 