import useFetch from "@/hooks/useFetch";
import React from 'react'

function Category() {
  useFetch("/sessions");

  return (
    <div>
      <h1>Coming Soon</h1>
    </div>
  )
}

export default Category
