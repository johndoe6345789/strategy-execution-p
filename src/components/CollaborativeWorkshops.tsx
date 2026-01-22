import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatCircleText, ThumbsUp, Plus, Users, PaperPlaneRight, Flag } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { StrategyCard } from '@/types'

interface Comment {
  id: string
  strategyCardId: string
  author: string
  content: string
  timestamp: number
  replies: Reply[]
  likes: string[]
  type: 'comment' | 'question' | 'suggestion' | 'concern'
}

interface Reply {
  id: string
  author: string
  content: string
  timestamp: number
  likes: string[]
}

interface Workshop {
  id: string
  name: string
  description: string
  strategyCardId: string
  facilitator: string
  participants: string[]
  status: 'scheduled' | 'active' | 'completed'
  startDate: string
  endDate?: string
  createdAt: number
}

export default function CollaborativeWorkshops() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [comments, setComments] = useKV<Comment[]>('strategy-comments', [])
  const [workshops, setWorkshops] = useKV<Workshop[]>('strategy-workshops', [])
  const [currentUser, setCurrentUser] = useState<string>('')
  const [selectedCard, setSelectedCard] = useState<string>('')
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<Comment['type']>('comment')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isWorkshopDialogOpen, setIsWorkshopDialogOpen] = useState(false)
  const [newWorkshop, setNewWorkshop] = useState({
    name: '',
    description: '',
    strategyCardId: '',
    facilitator: '',
    participants: '',
    startDate: ''
  })

  useEffect(() => {
    const loadUser = async () => {
      const user = await window.spark.user()
      setCurrentUser(user?.login || 'Anonymous')
    }
    loadUser()
  }, [])

  const addComment = () => {
    if (!newComment.trim() || !selectedCard) {
      toast.error('Please select a strategy and enter a comment')
      return
    }

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      strategyCardId: selectedCard,
      author: currentUser,
      content: newComment,
      timestamp: Date.now(),
      replies: [],
      likes: [],
      type: commentType
    }

    setComments((current) => [...(current || []), comment])
    setNewComment('')
    setCommentType('comment')
    toast.success('Comment added!')
  }

  const addReply = (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply')
      return
    }

    setComments((current) =>
      (current || []).map(c =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `reply-${Date.now()}`,
                  author: currentUser,
                  content: replyContent,
                  timestamp: Date.now(),
                  likes: []
                }
              ]
            }
          : c
      )
    )

    setReplyContent('')
    setReplyTo(null)
    toast.success('Reply added!')
  }

  const toggleLike = (commentId: string, isReply: boolean = false, replyId?: string) => {
    setComments((current) =>
      (current || []).map(c => {
        if (isReply && replyId) {
          return c.id === commentId
            ? {
                ...c,
                replies: c.replies.map(r =>
                  r.id === replyId
                    ? {
                        ...r,
                        likes: r.likes.includes(currentUser)
                          ? r.likes.filter(u => u !== currentUser)
                          : [...r.likes, currentUser]
                      }
                    : r
                )
              }
            : c
        }
        return c.id === commentId
          ? {
              ...c,
              likes: c.likes.includes(currentUser)
                ? c.likes.filter(u => u !== currentUser)
                : [...c.likes, currentUser]
            }
          : c
      })
    )
  }

  const createWorkshop = () => {
    if (!newWorkshop.name.trim() || !newWorkshop.strategyCardId || !newWorkshop.facilitator.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const workshop: Workshop = {
      id: `workshop-${Date.now()}`,
      name: newWorkshop.name,
      description: newWorkshop.description,
      strategyCardId: newWorkshop.strategyCardId,
      facilitator: newWorkshop.facilitator,
      participants: newWorkshop.participants.split(',').map(p => p.trim()).filter(p => p),
      status: 'scheduled',
      startDate: newWorkshop.startDate,
      createdAt: Date.now()
    }

    setWorkshops((current) => [...(current || []), workshop])
    setIsWorkshopDialogOpen(false)
    setNewWorkshop({
      name: '',
      description: '',
      strategyCardId: '',
      facilitator: '',
      participants: '',
      startDate: ''
    })
    toast.success('Workshop created!')
  }

  const updateWorkshopStatus = (workshopId: string, status: Workshop['status']) => {
    setWorkshops((current) =>
      (current || []).map(w =>
        w.id === workshopId
          ? { ...w, status, endDate: status === 'completed' ? new Date().toISOString() : undefined }
          : w
      )
    )
    toast.success(`Workshop ${status}`)
  }

  const cardComments = selectedCard
    ? (comments || []).filter(c => c.strategyCardId === selectedCard)
    : []

  const commentTypeConfig = {
    comment: { label: 'Comment', color: 'default' },
    question: { label: 'Question', color: 'secondary' },
    suggestion: { label: 'Suggestion', color: 'default' },
    concern: { label: 'Concern', color: 'destructive' }
  }

  const statusColors = {
    scheduled: 'secondary',
    active: 'default',
    completed: 'outline'
  } as const

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collaborative Workshops</h2>
          <p className="text-muted-foreground mt-2">
            Real-time collaboration and discussion on strategic initiatives
          </p>
        </div>
        <Dialog open={isWorkshopDialogOpen} onOpenChange={setIsWorkshopDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Create Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Strategy Workshop</DialogTitle>
              <DialogDescription>
                Set up a collaborative workshop to discuss and refine a strategy
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Workshop Name</label>
                <Input
                  value={newWorkshop.name}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, name: e.target.value })}
                  placeholder="e.g., Q1 Strategy Review"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newWorkshop.description}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                  placeholder="Workshop goals and agenda..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Strategy Card</label>
                <Select
                  value={newWorkshop.strategyCardId}
                  onValueChange={(value) => setNewWorkshop({ ...newWorkshop, strategyCardId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {(strategyCards || []).map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Facilitator</label>
                  <Input
                    value={newWorkshop.facilitator}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, facilitator: e.target.value })}
                    placeholder="Facilitator name"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newWorkshop.startDate}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, startDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Participants</label>
                <Input
                  value={newWorkshop.participants}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, participants: e.target.value })}
                  placeholder="Comma-separated names"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWorkshopDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createWorkshop}>Create Workshop</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workshops?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{comments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(workshops || []).filter(w => w.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {(workshops || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workshops</CardTitle>
            <CardDescription>Scheduled and active strategy workshops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(workshops || []).map((workshop) => {
                const card = (strategyCards || []).find(c => c.id === workshop.strategyCardId)
                return (
                  <Card key={workshop.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{workshop.name}</h4>
                            <Badge variant={statusColors[workshop.status]}>
                              {workshop.status}
                            </Badge>
                          </div>
                          {workshop.description && (
                            <p className="text-sm text-muted-foreground mb-2">{workshop.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Strategy: {card?.title || 'Unknown'}</span>
                            <span>Facilitator: {workshop.facilitator}</span>
                            <span>Date: {new Date(workshop.startDate).toLocaleDateString()}</span>
                          </div>
                          {workshop.participants.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Users size={14} className="text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {workshop.participants.length} participants
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {workshop.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => updateWorkshopStatus(workshop.id, 'active')}
                            >
                              Start
                            </Button>
                          )}
                          {workshop.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateWorkshopStatus(workshop.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Selection</CardTitle>
            <CardDescription>Choose a strategy to discuss</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {(strategyCards || []).map((card) => {
                  const cardCommentCount = (comments || []).filter(c => c.strategyCardId === card.id).length
                  return (
                    <Card
                      key={card.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCard === card.id ? 'border-accent shadow-md' : ''
                      }`}
                      onClick={() => setSelectedCard(card.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {card.framework}
                            </Badge>
                          </div>
                          {cardCommentCount > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <ChatCircleText size={12} />
                              {cardCommentCount}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
              <CardDescription>
                {selectedCard
                  ? `Commenting on: ${(strategyCards || []).find(c => c.id === selectedCard)?.title}`
                  : 'Select a strategy to start commenting'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="concern">Concern</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, questions, or suggestions..."
                    rows={3}
                    className="flex-1"
                    disabled={!selectedCard}
                  />
                </div>
                <Button onClick={addComment} disabled={!selectedCard} className="gap-2">
                  <PaperPlaneRight size={16} weight="bold" />
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discussion ({cardComments.length})</CardTitle>
              <CardDescription>Comments and feedback on this strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {cardComments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments yet. Start the discussion!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cardComments.map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {comment.author[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{comment.author}</span>
                                  <Badge variant={commentTypeConfig[comment.type].color as any} className="text-xs">
                                    {commentTypeConfig[comment.type].label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    onClick={() => toggleLike(comment.id)}
                                  >
                                    <ThumbsUp
                                      size={14}
                                      weight={comment.likes.includes(currentUser) ? 'fill' : 'regular'}
                                    />
                                    {comment.likes.length > 0 && comment.likes.length}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                  >
                                    Reply
                                  </Button>
                                </div>

                                {replyTo === comment.id && (
                                  <div className="mt-3 space-y-2">
                                    <Textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Write a reply..."
                                      rows={2}
                                      className="text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => addReply(comment.id)}>
                                        Post Reply
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setReplyTo(null)
                                          setReplyContent('')
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {comment.replies.length > 0 && (
                                  <div className="mt-3 ml-4 space-y-2 border-l-2 border-border pl-3">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                              {reply.author[0].toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="font-semibold text-xs">{reply.author}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(reply.timestamp).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-sm ml-8">{reply.content}</p>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 gap-1 text-xs ml-8"
                                          onClick={() => toggleLike(comment.id, true, reply.id)}
                                        >
                                          <ThumbsUp
                                            size={12}
                                            weight={reply.likes.includes(currentUser) ? 'fill' : 'regular'}
                                          />
                                          {reply.likes.length > 0 && reply.likes.length}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
