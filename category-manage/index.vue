<template>
  <div class="bg-white">
    <v-container >
      <v-row class="justify-center mt-6">
        <v-col cols="12" md="6"> 
          <div class="d-flex justify-end mb-4">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              class="primary-btn-common-font-style"
              @click="addCategory()"
              >カテゴリ追加</v-btn
            >
          </div>
          <v-list
            class="w-100"
            elevation="2"
            style="padding: 0"
            v-if="categories.length > 0"
          >
            <template v-for="(category, index) in categories" :key="category.id">
              <v-list-item>
                <template v-slot:default>
                  <div class="category-name">
                    {{ category.name }}
                  </div>
                </template>
                <template v-slot:append>
                  <v-btn
                    color="error"
                    class="primary-btn-common-font-style"
                    @click="deleteCategory(category)"
                    >削除</v-btn
                  >
                </template>
              </v-list-item>
              <!-- 最後の要素以外には v-divider を表示 -->
              <v-divider v-if="index !== categories.length - 1"></v-divider>
            </template>
          </v-list>
          <!-- カテゴリがない場合のメッセージ -->
          <p v-else class="text-center text-grey-darken-1 mt-4">
            カテゴリを追加してください
          </p>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card>
        <v-card-item>
          <v-card-title>カテゴリの追加</v-card-title>
          <v-text-field
            v-model="inputCategory"
            label="カテゴリ名を入力"
            @input="clearError"
          />
          <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false"> キャンセル </v-btn>
          <v-btn
            :disabled="inputCategory.trim() === ''"
            @click="registerCategory()"
          >
            <!-- v-btn nullなら押せなくする -->
            登録
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-item>
          <v-card-title>カテゴリの削除</v-card-title>
          <v-card-text class="pa-4">
            以下のカテゴリを削除します。よろしいですか？
            <strong class="d-block mt-4">{{ selectedCategory?.name }}</strong>
          </v-card-text>
        </v-card-item>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false"> キャンセル </v-btn>
          <v-btn @click="confirmDelete()"> 削除 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ローディングインジケーター -->
    <v-dialog v-model="isLoading" hide-overlay persistent origin="top left">
      <v-card color="primary" dark>
        <v-overlay
          :model-value="isLoading"
          persistent
          class="align-center justify-center"
        >
          <v-progress-circular indeterminate />
        </v-overlay>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const nuxtApp = useNuxtApp()
const dialog = ref(false)
const inputCategory = ref('')
const errorMessage = ref('')
const selectedCategory = ref('')
const deleteDialog = ref(false)
const categories = ref([])

// ローディング状態用の reactive 変数
const isLoading = ref(false)

// 初期処理
onMounted(() => {
  fetchCategories()
})

// カテゴリ追加ボタン
function addCategory() {
  errorMessage.value = ''
  inputCategory.value = ''
  dialog.value = true
}

// カテゴリ追加確定ボタン
function registerCategory() {
  if (inputCategory.value.trim() === '') {
    errorMessage.value = 'カテゴリ名を入力してください'
    return
  } else if (
    categories.value.find(
      (c) => c.name.toLowerCase() === inputCategory.value.toLowerCase()
    )
  ) {
    errorMessage.value = 'このカテゴリはすでに存在します'
    return
  } else {
    errorMessage.value = ''
    insertCategory(inputCategory.value)
    inputCategory.value = ''
    dialog.value = false
  }
}

// 入力変更時にエラーメッセージをクリア
function clearError() {
  errorMessage.value = ''
}

// 削除ボタン
function deleteCategory(category) {
  selectedCategory.value = category
  deleteDialog.value = true
}

// 削除確定ボタン
function confirmDelete() {
  rejectCategory(selectedCategory.value.id)
  deleteDialog.value = false
  selectedCategory.value = ''
}

//カテゴリ一覧を取得
const fetchCategories = async () => {
  isLoading.value = true
  try {
    const result = await nuxtApp.$httpsCallable('readCategories', {})
    categories.value = result.data.categories.map((item) => ({
      id: item.id,
      name: item.category_name,
    }))
  } catch (error) {
    console.error('fetchCategories:', error)
    window.alert('カテゴリ一覧の取得に失敗しました。リロードしてください。')
  } finally {
    isLoading.value = false
  }
}

//カテゴリを追加
const insertCategory = async (name) => {
  isLoading.value = true
  try {
    const result = await nuxtApp.$httpsCallable('createCategory', { name })
    fetchCategories()
  } catch (error) {
    window.alert('カテゴリの追加ができませんでした。もう一度お試しください。')
  } finally {
    isLoading.value = false
  }
}

// カテゴリを削除
const rejectCategory = async (id) => {
  isLoading.value = true
  try {
    const result = await nuxtApp.$httpsCallable('removeCategory', { id })
    fetchCategories()
  } catch (error) {
    console.error('removeCategory:', error)
    window.alert('カテゴリの削除ができませんでした。もう一度お試しください。')
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
  .category-name{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
