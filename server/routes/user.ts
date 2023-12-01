import express from 'express'
import {
  addUser,
  fetchAllUsers,
  fetchUser,
  removeUser,
  updateUser,
} from '../db/functions/users'
import { auth } from 'express-oauth2-jwt-bearer'

const router = express.Router()

const jwtCheck = auth({
  audience: 'https://chorequest/api',
  issuerBaseURL: 'https://manaia-2023-pete.au.auth0.com/',
  tokenSigningAlg: 'RS256',
})

router.get('/', jwtCheck, async (req, res) => {
  try {
    const authId = req.auth?.payload.sub as string
    console.log('route', authId)
    console.log('happy')

    const profile = await fetchUser(authId)


    if (!profile) {
      res.json({ message: 'Need to create profile' })
    } else {
      res.json({ profile })
    }
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})


router.post('/', async (req, res) => {
  try {
    const newUser = req.body
    const profile = await addUser(newUser)
    res.json({ profile })
  } catch (err) {
    res.status(500).json({
      message: 'an error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})

router.patch('/', async (req, res) => {
  try {
    const updatedUser = req.body
    const renewedUser = await updateUser(updatedUser)
    res.json({ renewedUser })
  } catch (err) {
    res.status(500).json({
      message: 'an error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const deletedUser = await removeUser(id)
    res.json(deletedUser)
  } catch (err) {
    res.status(500).json({
      message: 'an error occurred',
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})

export default router