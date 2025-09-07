const functions = require('firebase-functions')
const supabase = require('../libs/supabase')

// カテゴリ一覧を取得
const readCategories = functions.https.onCall(async (_data, _context) => {
  try {
    const { data: categories, error } = await supabase
      .from('category_table') // カテゴリテーブル名
      .select('*') // すべてのデータを取得

    if (error) {
      throw error
    } else {
      return {
        message: 'successfully',
        categories,
      }
    }
  } catch (error) {
    console.error('Error in readCategories:', error.message)
    throw error
  }
})

//新しいカテゴリを追加
const createCategory = functions.https.onCall(async (data, _context) => {
  try {
    const { name } = data // 受け取ったデータから name を取得
    const { data: newCategory, error } = await supabase
      .from('category_table')
      .insert({ category_name: name })
      .select() // 追加したデータを取得

    if (error) {
      throw error
    } else {
      return {
        message: 'successfully',
        newCategory,
      }
    }
  } catch (error) {
    console.error('Error in createCategory:', error.message)
    throw error
  }
})

const removeCategory = functions.https.onCall(async (data, _context) => {
  try {
    const { id } = data
    const { error } = await supabase
      .from('category_table')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    } else {
      return {
        message: 'successfully',
      }
    }
  } catch (error) {
    console.error('Error in removeCategory:', error.message)
    throw error
  }
})

module.exports = {
  readCategories,
  createCategory,
  removeCategory,
}
