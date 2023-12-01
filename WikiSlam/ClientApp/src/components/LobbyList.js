import React from 'react'
import { ListGroup, CloseButton, Button, Container, Row, Col, Stack } from 'react-bootstrap'
import { motion } from "framer-motion"

export function LobbyList({loggedInUser, users, isAdmin, onCloseCallback, onEditCallback}) {
  return (
    <ListGroup>
      {users.map(user => (
        <motion.div whileHover={{x: -10}}>
        <ListGroup.Item key={user.id}>
          <Stack direction='horizontal'>
            <div className='fs-1'>{user.isAdmin ? "👑" : "♟"}</div>
            <div className='mx-auto fs-4 text-center'>{user.name}</div>
            <div className='d-flex' style={{width:"10%"}}>
              {isAdmin && user.id !== loggedInUser.id && <CloseButton className='mx-auto bg-light' onClick={()=>{onCloseCallback(user)}}/>}
              {user.id === loggedInUser.id && <Button className='mx-auto' onClick={onEditCallback}>✏</Button>}
            </div>
          </Stack>
        </ListGroup.Item>
        </motion.div>
      ))}
    </ListGroup>
)
}
