import Sidebar from '@/components/Sidebar'
import React from 'react'

export default function layout({children}: {children: React.ReactNode}) {
  return (
    <div className='flex'>
        <Sidebar />
        <div className='flex-1'>{children}</div>
    </div>
  )
}
