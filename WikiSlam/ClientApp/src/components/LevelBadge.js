import React, {useEffect} from 'react'
import { Badge, Spinner, Stack } from 'react-bootstrap'
import { useAnimate } from "framer-motion"

export default function LevelBadge({size, article, isLoading, spacing}) {

  const [badgeReference, animateBadge] = useAnimate()

  useEffect(()=>{
    animateBadge(badgeReference.current, {
      scale: [1, 1.1, 1.1, 1.2, 1],
      rotate: [0, -10, 0, 10, 0]
    }, {duration: 0.2})
  }, [article, (article) ? article.level : null])

  return (
    <Badge ref={badgeReference} bg="info" pill className={`${spacing} p-${size}`}>
      {(isLoading) ? <Spinner className='mx-2'/> : 
        <Stack direction='horizontal'>
          <span className={`mt-2 mx-1 fs-${7 - size}`}>Lvl </span> 
          <span className=' mt-auto fs-1'>{article.level}</span>
        </Stack>
      }
    </Badge>
            
  )
}
