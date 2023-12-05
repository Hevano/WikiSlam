import React from 'react'
import { Toast } from 'react-bootstrap'
import {ToastContainer} from 'react-bootstrap'

export default function JoinErrorToast({errorTitle, errorMsg, dismissCallback}) {
  return (
    <ToastContainer
          className="position-fixed top-0 start-0 translate-middle p-3"
          position="top-center"
          style={{ zIndex: 1 }}
        >
      <Toast onClose={dismissCallback} >
        <Toast.Header className="bg-warning fs-5 text-primary-emphasis" closeButton={false}>
          {errorTitle}
        </Toast.Header>
        <Toast.Body className="bg-active text-light">{errorMsg}</Toast.Body>
      </Toast>
    </ToastContainer>
  )
}
