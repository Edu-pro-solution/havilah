import useFetch from "@/hooks/useFetch";
import React from 'react'

export const AcademicSyllabus = () => {
  useFetch("/sessions");

  return (
    <h1>Coming soon</h1>
  )
}
