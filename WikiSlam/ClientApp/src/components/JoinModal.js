import React from 'react'
import { Modal } from 'react-bootstrap'
import { JoinForm } from './JoinForm'

export function JoinModal({show, handleClose}) {

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
