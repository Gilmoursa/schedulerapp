# Task Scheduler

A browser-based tool for assigning tasks to people with automatic workload balancing.

## How to use

1. Add each person by name and set their available hours for the week
2. Add tasks with a name and estimated duration in hours
3. Tasks are automatically assigned to whoever has the most remaining capacity
4. Check tasks off as they're completed — they free up the person's hours

## Features

- **Workload-balanced assignment** — tasks go to the least-loaded person who still has capacity; falls back to least-loaded overall if everyone is over their limit
- **Weekly availability** — set how many hours each person has this week; a capacity bar shows assigned vs. available at a glance
- **Task completion** — check off tasks to strikethrough and dim them; unchecking restores them and returns the hours
- **Delete people and tasks** — remove any row with the ✕ button; deleting a person automatically reassigns their tasks
- **Persistent storage** — all data is saved to localStorage and survives a page refresh

## Roadmap

- Save data to a backend so multiple people can view and update the schedule from different devices
