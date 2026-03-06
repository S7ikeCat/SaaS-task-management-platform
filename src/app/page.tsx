import { prisma } from "@/shared/lib/prisma"

export default async function Home() {

  const users = await prisma.user.count()
  const projects = await prisma.project.count()
  const tasks = await prisma.task.count()

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Task SaaS</h1>

      <div className="mt-6 space-y-2">
        <p>Users: {users}</p>
        <p>Projects: {projects}</p>
        <p>Tasks: {tasks}</p>
      </div>
    </main>
  )
}