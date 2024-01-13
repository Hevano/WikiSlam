import React from 'react'
import { Button } from 'react-bootstrap'
import { motion } from "framer-motion"

export default function RerollButton({disabled, onClick, smallBreakpoint}) {
  let breakpoint = (smallBreakpoint) ? "d-block d-md-none" : "d-none d-md-block" ;
  return (
    <div className={`mx-auto ${breakpoint}`}>
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Button variant="warning" className='fs-1 mt-auto mx-auto p-2' disabled={disabled} onClick={onClick}>🎲</Button>
      </motion.div>
      <p className='text-light mx-auto text-center mb-auto'>REROLL</p>
    </div>
  )
}
