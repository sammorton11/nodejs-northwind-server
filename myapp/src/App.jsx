import { createSignal } from 'solid-js'
import './App.css'

function App() {
  const [count, setCount] = createSignal(0);
  const [users, setUsers] = createSignal([]);

  async function getUsers() {
    try {
      const response = await fetch('http://localhost:3000/users');
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUsers(data);
      } 
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <>
      <ul>
        {users && users().map(item => (
            <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <button onClick={getUsers}>Get Users</button>
    </>
  )
}

export default App
