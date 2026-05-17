import useFetch from "@/hooks/useFetch";
import React from 'react'

function StudentPromotion() {
  useFetch("/sessions");

  return (
    <div>
      <h1>Coming Soon</h1>
    </div>
  )
}

export default StudentPromotion
