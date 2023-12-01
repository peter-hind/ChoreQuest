import { ChangeEvent, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addChore } from '../apis/chores'
import { ChoreData } from '../../models/chores'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'

const initalForm = {
  name: '',
  points: '',
  created: DateTime.local().toISODate(), // luxon
}

const AddChore = () => {
  const [form, setForm] = useState<ChoreData>(initalForm)
  const queryClient = useQueryClient()

  const addChoreMutation = useMutation({
    mutationFn: addChore,
    onSuccess: () => {
      try {
        queryClient.invalidateQueries(['chores'])
      } catch (err) {
        console.log(err)
      }
    },
  })
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | Date | null>
  ) {
    const { name, value } = e.target || { name: '', value: null }
    //console.log('name, value', name, value)
    let newValue: string | null = null

    // If the input is the 'created' date, value will be a Date object or null
    if (name === 'created') {
      console.log('value, type', value, typeof value)
      if (value instanceof Date) {
        console.log('2')
        newValue = DateTime.fromJSDate(value).toISODate() || null
        console.log('Luxon Formatted Date:', newValue)
      } else if (typeof value === 'string') {
        console.log('value is string')
        newValue = value //Date.parse(value)
      } else if (value === null) {
        console.log('3')
        newValue = null
      }
      console.log('newValue', newValue)
    } else {
      console.log('4')
      newValue = value as string | null
    }

    const newForm = { ...form, [name]: newValue }
    setForm(newForm)
  }

  function handleAddChange(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault()
    addChoreMutation.mutate(form)
    console.log(form, typeof form.created)
    setForm(initalForm)
    console.log(initalForm, typeof initalForm.created)
  }

  return (
    <>
      <div>
        <form
          action=""
          onSubmit={handleAddChange}
          aria-label="Add Chore Form"
          className="flex flex-col items-center justify-center"
        >
          <div className="border p-8 border-gray-900/10 m-8">
            <h2 className="mx-auto mt-12 mb-6 text-center">Add new chore</h2>
            <div className="space-y-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="text-2xl">
                    Name:
                  </label>
                  <input
                    id="name"
                    onChange={handleChange}
                    name="name"
                    value={form.name}
                    className="m-4 border-solid border-2 border-black p-2 px-5 rounded-lg mb-12"
                  ></input>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="points" className="text-2xl">
                  Points:
                </label>
                <input
                  id="points"
                  onChange={handleChange}
                  name="points"
                  value={form.points}
                  className="m-4 border-solid border-2 border-black p-2 px-5 rounded-lg mb-12"
                ></input>
              </div>
              <div className="form-group">
                <DatePicker
                  id="created"
                  selected={DateTime.fromISO(form.created).toJSDate()} // Convert Luxon date to JavaScript Date
                  onChange={(date) => {
                    if (date) {
                      const isoDate = DateTime.fromJSDate(date).toISODate()
                      console.log('Luxon Formatted Date:', isoDate)
                      handleChange({
                        target: { name: 'created', value: isoDate },
                      } as ChangeEvent<HTMLInputElement>)
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <button className="btn-primary mb-12 items-center justify-center">
                Add Chore
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default AddChore