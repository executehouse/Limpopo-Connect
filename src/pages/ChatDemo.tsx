/**
 * Chat Demo Page
 * 
 * Simple demo page to test room creation, messaging, and realtime functionality
 */

import React, { useState } from 'react'
import { MessageCircle, Plus, Users, Send, Loader2 } from 'lucide-react'
import { useAuthContext } from '../lib/AuthProvider'
import { useRooms, useRoomMessages } from '../lib/useRooms'

const ChatDemo: React.FC = () => {
  const { user, profile, signOut } = useAuthContext()
  const { rooms, loading: roomsLoading, createRoom, joinRoom } = useRooms()
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const { messages, loading: messagesLoading, sendMessage } = useRoomMessages(selectedRoomId)
  
  const [newRoomName, setNewRoomName] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return
    
    setIsCreatingRoom(true)
    try {
      const room = await createRoom(newRoomName.trim())
      setNewRoomName('')
      setSelectedRoomId(room.id)
    } catch (error) {
      console.error('Failed to create room:', error)
      alert('Failed to create room: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoomId) return
    
    setIsSendingMessage(true)
    try {
      await sendMessage(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <MessageCircle className="mx-auto h-16 w-16 text-limpopo-green mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat Demo</h1>
          <p className="text-gray-600 mb-6">Please login to access the chat functionality.</p>
          <a 
            href="/login" 
            className="btn-primary inline-flex items-center"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="mr-2 h-8 w-8 text-limpopo-green" />
              Chat Demo
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {profile?.first_name || user.email}
              </div>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rooms Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Rooms
                </h2>
              </div>
              
              {/* Create Room */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                  />
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom || !newRoomName.trim()}
                    className="px-3 py-2 bg-limpopo-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingRoom ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Rooms List */}
              <div className="max-h-96 overflow-y-auto">
                {roomsLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading rooms...
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No rooms yet. Create one to get started!
                  </div>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                        selectedRoomId === room.id ? 'bg-limpopo-blue bg-opacity-10 border-l-4 border-l-limpopo-blue' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{room.name}</div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(room.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
              {selectedRoomId ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      {rooms.find(r => r.id === selectedRoomId)?.name || 'Unknown Room'}
                    </h3>
                    <p className="text-sm text-gray-500">Room ID: {selectedRoomId}</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="text-center text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.user_id === user.id
                                ? 'bg-limpopo-blue text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-sm">{message.body}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.user_id === user.id ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {message.user_id === user.id ? 'You' : (
                                message.profiles?.first_name || 
                                message.profiles?.email || 
                                'Unknown User'
                              )} • {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isSendingMessage || !newMessage.trim()}
                        className="px-4 py-2 bg-limpopo-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a room to start chatting</p>
                    <p className="text-sm">Choose a room from the sidebar or create a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatDemo