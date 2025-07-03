'use client'
import { useEffect } from 'react'
import { useState } from 'react'

const MyFormComponent = ({ formId }: { formId: string }) => {
  const [cmsForm, setCmsForm] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // get the form from payload
  useEffect(() => {
    // fetch the form config
    fetch(`/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => {
        setCmsForm(data)
        console.log('cmsForm', data)
      })
      .catch((err) => setError('Error loading form'))
  }, [formId])

  // render the form based on field types

  // handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    console.log('Form data i got')
    console.log(formData)
  }

  return (
    <div>
      <h2>Form</h2>
      <form onSubmit={handleSubmit}>
        {cmsForm.fields.map((field: any) => (
          <div key={field.id}>
            <label htmlFor={field.name}>{field.label}</label>
            <input type={field.blockType} name={field.name} id={field.id} />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default MyFormComponent
