/* projects.js - team projects: members, tasks and a leader */

const Projects = {
  find(id) {
    return Store.data.projects.find((p) => p.id === id);
  },

  render() {
    const projects = Store.data.projects;
    let body;

    if (projects.length === 0) {
      body = '<div class="card empty">' + icon("users", 40) + '<h3>No projects yet</h3>' +
        '<p class="muted">Tap + to create a team project and give each member a task.</p></div>';
    } else {
      body = '<ul class="project-list">' + projects.map(function (project) {
        const total = project.members.length;
        const done = project.members.filter((m) => m.done).length;
        const percent = total === 0 ? 0 : Math.round(done / total * 100);

        const members = project.members.map(function (member) {
          return '<li class="member' + (member.done ? ' done' : '') + '">' +
            '<button class="check' + (member.done ? ' on' : '') + '" data-action="toggle-member" data-pid="' + project.id + '" data-mid="' + member.id + '" aria-label="Mark member task as done">' + icon("check", 18) + '</button>' +
            '<div class="member-info"><div class="member-name">' + esc(member.name) +
            (member.leader ? '<span class="badge">Leader</span>' : '') + '</div>' +
            '<div class="member-task">' + (member.task ? esc(member.task) : "No task yet") + '</div></div></li>';
        }).join("");

        return '<li class="card project" data-id="' + project.id + '">' +
          '<div class="project-head"><div><h3>' + esc(project.name) + '</h3>' +
          '<p class="sub">' + done + ' of ' + total + ' tasks done</p></div>' +
          '<div class="task-actions">' +
          '<button class="icon-btn small" data-action="edit-project" aria-label="Edit project">' + icon("edit", 18) + '</button>' +
          '<button class="icon-btn small danger" data-action="delete-project" aria-label="Delete project">' + icon("trash", 18) + '</button>' +
          '</div></div>' +
          '<div class="progress"><span style="width:' + percent + '%"></span></div>' +
          '<ul class="members">' + members + '</ul></li>';
      }).join("") + '</ul>';
    }

    $("#view").innerHTML =
      '<div class="page-head"><h1>Projects</h1><p class="sub">' + projects.length + ' total</p></div>' + body;
  },

  toggleMember(projectId, memberId) {
    const project = this.find(projectId);
    if (!project) return;
    const member = project.members.find((m) => m.id === memberId);
    if (!member) return;
    member.done = !member.done;
    Store.save();
    this.render();
  },

  remove(id) {
    const project = this.find(id);
    if (!project) return;
    confirmSheet('"' + project.name + '" will be deleted.', "Delete", () => {
      Store.data.projects = Store.data.projects.filter((p) => p.id !== id);
      Store.save();
      this.render();
      toast("Project deleted.");
    });
  },

  // Draws the member boxes (one per member)
  drawMembers(container, members) {
    container.innerHTML = members.map(function (member, index) {
      return '<div class="member-card">' +
        '<div class="member-head"><span>MEMBER ' + (index + 1) + '</span>' +
        '<label class="radio"><input type="radio" name="leader" value="' + index + '"' + (member.leader ? ' checked' : '') + '><span>Leader</span></label></div>' +
        '<input class="field m-name" placeholder="Member name" maxlength="40" value="' + esc(member.name) + '">' +
        '<input class="field m-task" placeholder="Task for this member" maxlength="120" value="' + esc(member.task) + '">' +
        '</div>';
    }).join("");
  },

  // Reads what the user typed in the member boxes
  readMembers(container) {
    const names = container.querySelectorAll(".m-name");
    const tasks = container.querySelectorAll(".m-task");
    const leaderRadio = container.querySelector('input[name="leader"]:checked');
    const leaderIndex = leaderRadio ? Number(leaderRadio.value) : 0;

    return Array.from(names).map(function (input, index) {
      return { name: input.value, task: tasks[index].value, leader: index === leaderIndex };
    });
  },

  openEditor(id) {
    const project = id ? this.find(id) : null;
    let members = project
      ? project.members.map((m) => ({ name: m.name, task: m.task, leader: m.leader }))
      : [{ name: "", task: "", leader: true }, { name: "", task: "", leader: false }];

    Sheet.open(
      '<h2 class="sheet-title">' + (project ? "Edit project" : "New project") + '</h2>' +
      '<label class="label" for="p-name">Project name</label>' +
      '<input id="p-name" class="field" maxlength="60" placeholder="e.g. Database Systems project" autocomplete="off">' +
      '<label class="label" for="p-count">Number of members</label>' +
      '<input id="p-count" class="field" type="number" inputmode="numeric" min="1" max="10">' +
      '<div id="p-members"></div>' +
      '<div class="sheet-actions">' +
      '<button class="btn" data-sheet="close">Cancel</button>' +
      '<button class="btn primary" id="p-save">' + (project ? "Save changes" : "Create project") + '</button>' +
      '</div>',
      function (sheet) {
        const nameInput = $("#p-name", sheet);
        const countInput = $("#p-count", sheet);
        const container = $("#p-members", sheet);

        nameInput.value = project ? project.name : "";
        countInput.value = members.length;
        Projects.drawMembers(container, members);

        // When the number changes, add or remove member boxes (keeping what was typed)
        countInput.addEventListener("input", function () {
          const wanted = parseInt(countInput.value, 10);
          if (isNaN(wanted)) return;
          const count = clamp(wanted, 1, 10);

          members = Projects.readMembers(container);
          while (members.length < count) members.push({ name: "", task: "", leader: false });
          members = members.slice(0, count);
          if (!members.some((m) => m.leader)) members[0].leader = true;
          Projects.drawMembers(container, members);
        });
        countInput.addEventListener("blur", function () {
          countInput.value = members.length;
        });

        $("#p-save", sheet).addEventListener("click", function () {
          const name = nameInput.value.trim();
          const typed = Projects.readMembers(container);

          if (!name) {
            toast("Please enter a project name.", "error");
            nameInput.focus();
            return;
          }
          if (typed.some((m) => !m.name.trim())) {
            toast("Every member needs a name.", "error");
            return;
          }
          Projects.save(project, name, typed);
        });
      }
    );
  },

  save(project, name, typedMembers) {
    const members = typedMembers.map(function (typed, index) {
      // when editing, keep the "done" state of members that were already there
      const old = project && project.members[index];
      return {
        id: old ? old.id : Store.uid(),
        name: typed.name.trim(),
        task: typed.task.trim(),
        leader: typed.leader,
        done: old ? old.done : false
      };
    });

    if (project) {
      project.name = name;
      project.members = members;
    } else {
      Store.data.projects.unshift({ id: Store.uid(), name: name, members: members, createdAt: Date.now() });
    }

    Store.save();
    Sheet.close();
    this.render();
    toast(project ? "Project updated." : "Project created.", "ok");
  }
};
