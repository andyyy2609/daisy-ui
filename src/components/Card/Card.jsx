import { Ghost, Search } from 'lucide-react'
import React from 'react'

export default function Card({slot, opacityvalue, action, disable,imageUrl}) {
  return (
    <div className='card card-border border-primary w-[300px] transition-all duration-200 ease-in hover:shadow-lg'>
        <figure className='p-2'>
            <img className='rounded-[calc(var(--radius-box)-.5rem)] object-cover object-center w-100 h-[200px]' style={{opacity: opacityvalue}} src={imageUrl} alt=""/>
        </figure>
        <div className="card-body gap-5">
            {slot}
            <button disabled={disable} className='btn btn-primary' onClick={action}><Ghost size={16} strokeWidth={2}/> Decrease Opacity 10%</button>
        </div>
    </div>
  )
}
