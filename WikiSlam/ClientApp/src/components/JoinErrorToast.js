import React from 'react'
import { Toast } from 'react-bootstrap'
import {ToastContainer} from 'react-bootstrap'

export default function JoinErrorToast({errorTitle, errorMsg, dismissCallback}) {
  return (
    <ToastContainer
          className="p-3"
          position="top-center"
          style={{ zIndex: 1 }}
        >
      <Toast onClose={dismissCallback}>
        <Toast.Header>
          {errorTitle}
        </Toast.Header>
        <Toast.Body>{errorMsg}</Toast.Body>
      </Toast>
    </ToastContainer>
  )
}
