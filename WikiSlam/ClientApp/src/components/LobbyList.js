import React from 'react'
import { ListGroup, CloseButton, Button, Container, Row, Col } from 'react-bootstrap'

export function LobbyList({loggedInUser, users, isAdmin, onCloseCallback, onEditCallback}) {
  return (
    <ListGroup>
      {users.map(user => (
        <ListGroup.Item key={user.id}>
          <Container>
            <Row>
              <Col>User: {user.name}</Col>
              <Col xs={2}>
                {isAdmin && user.id !== loggedInUser.id && <CloseButton onClick={()=>{onCloseCallback(user)}}/>}
                {user.id === loggedInUser.id && <Button  onClick={onEditCallback}>✏</Button>}
              </Col>
            </Row>
          </Container>
        </ListGroup.Item>
      ))}
    </ListGroup>
)
}
