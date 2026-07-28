import React from 'react'

export default function InputRange({value, action, classname}) {
  return (
    <>
      <input type="range" min="0" max="100" value={value} onChange={action} className={`range ${classname}`} />
    </>
  )
}
