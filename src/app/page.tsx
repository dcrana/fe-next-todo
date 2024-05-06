'use client'
import { useEffect, useState } from 'react'
import AddTodo from '@/containers/AddTodo'
import TodoList from '@/containers/TodoList'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { ADDMUT, DELETEMUT, GETQUERY, UPDATEMUT } from '@/query/schema'
import { useMutation } from '@apollo/client'

export default function Home() {
  const [todos, setTodos] = useState<any[]>([])
  const [createTodo] = useMutation(ADDMUT)
  const [updateTodo] = useMutation(UPDATEMUT)
  const [deleteTodo] = useMutation(DELETEMUT)

  //fetch todo data
  const { loading, error, data } = useQuery(GETQUERY, {
    fetchPolicy: 'no-cache',
  })

  useEffect(() => {
    setTodos(data?.todos?.data) //Storing all the todos
  }, [data])

  const addTodo = async (todoText: string) => {
    await createTodo({
      variables: {
        todoText: todoText,
      },
    }).then(({ data }: any) => {
      setTodos([...todos, data.createTodo?.data] as any)
    })
  }
  const editTodoItem = async (todo: any) => {
    const newTodoText = prompt('Enter new todo text or description:')
    if (newTodoText) {
      await updateTodo({
        variables: {
          id: todo.id,
          todoText: newTodoText,
        },
      }).then(({ data }: any) => {
        const moddedTodos: any[] = todos.map((_todo: any) => {
          if (_todo.id === todo.id) {
            return data?.updateTodo?.data
          } else {
            return _todo
          }
        })
        setTodos(moddedTodos)
      })
    }
  }
  const deleteTodoItem = async (todo: any) => {
    if (confirm('Do you really want to delete this item')) {
      await deleteTodo({
        variables: {
          id: todo.id,
        },
      }).then(({ data }: any) => {
        const newTodos = todos.filter((item: any) => item.id !== todo.id)
        setTodos(newTodos as any)
      })
    }
  }
  return (
    <div>
      <main className="main">
        {loading && <span>Loading...</span>}
        {error && <span className="error">{error.message}</span>}
        <AddTodo addTodo={addTodo} />
        <TodoList
          todos={todos}
          deleteTodoItem={deleteTodoItem}
          editTodoItem={editTodoItem}
        />
      </main>
    </div>
  )
}
