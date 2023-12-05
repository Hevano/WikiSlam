import React, { useRef } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'

export function EditNameModal({show, handleClose, handleCreate, isLoading, modalTitle, modalLabel, buttonLabel}) {

  const userNameRef = useRef()

  return (
    <Modal
        show={show}
        onHide={handleClose}
        centered
        backdrop={true}
      >
        <Modal.Dialog>
            <Modal.Header closeButton>
            <Modal.Title>{modalTitle ? modalTitle : "Create New Lobby"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>{modalLabel ? modalLabel : "To Get Started, Enter Your Username"}</Form.Label>
                  <Form.Control
                    placeholder="Name"
                    autoFocus
                    ref={userNameRef}
                  />
                </Form.Group>
            </Form>
            </Modal.Body>

            <Modal.Footer>
            <Button disabled={isLoading} variant="primary" onClick={()=>{handleCreate(userNameRef.current.value)}}>{isLoading ? <Spinner/> : (buttonLabel ? buttonLabel : "Create")}</Button>
            </Modal.Footer>
        </Modal.Dialog>
      </Modal>
  )
}
