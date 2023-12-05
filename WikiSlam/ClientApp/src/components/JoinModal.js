import React, { useRef } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { JoinForm } from './JoinForm'

export function JoinModal({show, handleClose}) {

  const userNameRef = useRef()

  return (
    <Modal
        show={show}
        onHide={handleClose}
        centered
      >
        <Modal.Dialog className='w-100'>
            <Modal.Header closeButton>
            <Modal.Title>Join Lobby</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <JoinForm/>
            </Modal.Body>
        </Modal.Dialog>
      </Modal>
  )
}
