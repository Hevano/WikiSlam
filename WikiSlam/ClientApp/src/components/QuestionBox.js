import React from 'react'
import { Container, Row, Col, Stack, Badge, Spinner } from 'react-bootstrap'
import { motion } from "framer-motion"

export default function QuestionBox({questionArray, isLoading, questionCallback}) {

  const lorem = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."`

  function QuestionEntry(questionIndex){
    return(
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
          <Stack className="bg-light text-primary-emphasis m-md-3 m-1 border rounded" direction='horizontal' onClick={()=>{questionCallback(questionArray[questionIndex].correctAnswer)}}>
            {(isLoading) ? 
            <Spinner className='mx-auto p-md-5'/> : 
            <><Badge className="m-md-4 p-md-5 mx-1">{questionIndex + 1}.</Badge><p>"{questionArray[questionIndex].text}"</p></>}
          </Stack>
      </motion.div>
    )
  }


  return (
    <Container>
      <Row>
        <Col md={6} sm={12}>
          {QuestionEntry(0)}
        </Col>
        <Col md={6} sm={12}>
          {QuestionEntry(1)}
        </Col>
      </Row>
      <Row className='h-50'>
        <Col md={6} sm={12}>
          {QuestionEntry(2)}
        </Col>
        <Col md={6} sm={12}>
          {QuestionEntry(3)}
        </Col>
      </Row>
    </Container>
  )
}
