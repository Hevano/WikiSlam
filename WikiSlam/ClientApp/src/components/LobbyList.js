import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { CloseButton } from 'react-bootstrap'

export function LobbyList({users, isAdmin, onCloseCallback}) {
  return (
    <ListGroup>
      {users.map(user => (
        <ListGroup.Item key={user.id}>User: {user.name} {isAdmin && <CloseButton onClick={()=>{onCloseCallback(user)}}/>} </ListGroup.Item>
      ))}
    </ListGroup>
)
}
