'use client'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { useEffect, useRef } from 'react'
import { useState } from 'react'

const MyFormComponent = ({ formId }: { formId: string }) => {
  const [cmsForm, setCmsForm] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [fileUploadedId, setFileUploadedId] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  // get the form from payload
  useEffect(() => {
    // fetch the form config
    fetch(`/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => {
        setCmsForm(data)
      })
      .catch((err) => setError('Error loading form'))
  }, [formId])

  // render the form based on field types

  // handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // get the file from the form data, if it exists
    const file = formData.get('file')
    if (file) {
      console.log('file', file)
      // upload the file to payload
      const formDataToSend = new FormData()
      formDataToSend.append('file', file as File)
      formDataToSend.append(
        '_payload',
        JSON.stringify({
          alt: (file as File).name,
        }),
      )
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formDataToSend,
      })
      console.log('response', response)
      if (!response.ok) {
        throw new Error('Failed to upload file')
      }
      const data = await response.json()
      console.log('data', data)
      setFileUploadedId(data?.doc?.id)
    }

    // delete the file from the form data, so it's not sent to payload,
    // cuz its already uploaded
    if (file) {
      formData.delete('file')
    }

    // convert the form data to a json object, for fields that are not files
    const dataToSend = Array.from(formData.entries()).map(([name, value]) => ({
      field: name,
      value: value.toString(),
    }))

    // send form data to payload

    const response = await fetch('/api/form-submissions', {
      method: 'POST',
      body: JSON.stringify({
        form: formId,
        submissionData: dataToSend,
        // we want to add the fileID only if its actually possible to upload a file and we gut a file uploaded
        ...(cmsForm?.hasAttachment && fileUploadedId ? { file: fileUploadedId } : {}),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      setSuccess(true)
    } else {
      setError('Form submission failed')
      setSuccess(false)
    }

    // reset the form
    formRef.current?.reset()
  }

  if (!cmsForm) return <div>Loading...</div>

  if (success && cmsForm.confirmationMessage) {
    setTimeout(() => {
      setSuccess(false)
    }, 5000)
    return <RichText data={cmsForm.confirmationMessage} />
  }

  return (
    <div>
      <h2>Form</h2>
      <form onSubmit={handleSubmit} ref={formRef}>
        {cmsForm?.fields.map((field: any) => (
          <div key={field.id}>
            <label htmlFor={field.name}>{field.label}</label>
            <input type={field.blockType} name={field.name} id={field.id} />
          </div>
        ))}
        {cmsForm?.hasAttachment && (
          <div>
            <label htmlFor="file">{cmsForm.hasAttachmentLabel || 'Attachment'}</label>
            <input type="file" name="file" id="file" />
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default MyFormComponent
