import React from 'react'
import { Container, Row, Col, Stack, Badge, Spinner } from 'react-bootstrap'
import { motion } from "framer-motion"

export default function QuestionBox({questionArray, isLoading, questionCallback}) {

  const lorem = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."`

  function QuestionEntry(questionIndex){
    return(
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
          <Stack className="bg-light text-primary-emphasis m-3 p-3 border rounded" direction='horizontal' onClick={()=>{questionCallback(questionArray[questionIndex].correctAnswer)}}>
            {(isLoading) ? 
            <Spinner className='mx-auto p-5'/> : 
            <><Badge className="m-4 p-4">{questionIndex + 1}.</Badge><p>"{questionArray[questionIndex].text}"</p></>}
          </Stack>
      </motion.div>
    )
  }


  return (
    <Container>
      <Row>
        <Col>
          {QuestionEntry(0)}
        </Col>
        <Col>
          {QuestionEntry(1)}
        </Col>
      </Row>
      <Row className='h-50'>
        <Col>
          {QuestionEntry(2)}
        </Col>
        <Col>
          {QuestionEntry(3)}
        </Col>
      </Row>
    </Container>
  )
}
