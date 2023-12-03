import db from '../connection'
import { FamilyFormData } from '@models/family'
import fs from 'fs'
import path from 'path'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function createFamily(
  familyData: FamilyFormData,
  image: File | null | any,
  auth_id: string
) {
  const allowedExtensions = ['.png']

  const trx = await db.transaction()

  let pictureUrl = null
  try {
    try {
      const fileExtension = path.extname(image.originalname).toLowerCase()
      if (image) {
        if (allowedExtensions.includes(fileExtension)) {
          const folderPath = './public/images/familyIcons'
          await fs.promises.mkdir(folderPath, { recursive: true })

          const uniqueFilename = `${uuidv4()}${extname(image.originalname)}`
          pictureUrl = uniqueFilename

          const filePath = `${folderPath}/${uniqueFilename}`

          await fs.promises.writeFile(filePath, image.buffer)
        }
      }
    } catch (error) {
      console.error('Error saving image:', error)
    }

    const [familyId] = await trx('family').insert({
      ...familyData,
      picture: pictureUrl,
    })
    if (!familyId) {
      throw new Error('Could not create your family')
    }

    const makeUserParent = await trx('users')
      .where({ auth_id })
      .update({ is_parent: true })

    if (makeUserParent !== 1) {
      throw new Error('Failed to make user a parent')
    }

    const joinedFamily = await trx('users')
      .where({ auth_id })
      .update({ family_id: familyId })

    if (joinedFamily !== 1) {
      throw new Error('Failed to update user record')
    }

    trx.commit()
    return { success: true, message: 'Successfully created a family' }
  } catch (error) {
    await trx.rollback()
    console.error('Error creating family:', error)
    throw error
  }
}

export async function joinFamily(familyData: FamilyFormData, auth_id: string) {
  const trx = await db.transaction()
  try {
    const [family] = await trx('family').where({
      name: familyData.name,
      password: familyData.password,
    })

    if (!family) {
      throw new Error('Could not find your family')
    }

    const joinedFamily = await trx('users')
      .where({ auth_id })
      .update({ family_id: family.id, is_parent: false })

    if (joinedFamily !== 1) {
      throw new Error('Failed to update user record')
    }

    trx.commit()
    return { success: true, message: 'Successfully joined the family' }
  } catch (error) {
    await trx.rollback()
    console.error('Error creating family:', error)
    throw error
  }
}
