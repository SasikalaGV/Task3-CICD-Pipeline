# ATU Project Board

CI/CD pipeline assignment (Task 3).

## Step 1 – Website

A basic static website with four pages:

| Page | File |
|---|---|
| Home – ATU Project Board | `index.html` |
| About | `about.html` |
| Project Details | `project.html` |
| Contact (name, email, message) | `contact.html` |

Shared files: `css/style.css` (styling) and `js/main.js` (menu and contact form validation).

## How to view it

Double-click `index.html` to open it in a web browser. No installation is needed.

## Pipeline plan – one tool per stage

| Stage | Tool |
|---|---|
| 1. Source code management | Git & GitHub |
| 2. Automated build & test | GitHub Actions |
| 3. Static analysis & security | Trivy |
| 4. Containerisation | Docker |
| 5. Deployment | Kubernetes (Minikube) |
| 6. Monitoring & logging | Prometheus |
