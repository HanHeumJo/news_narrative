const token = localStorage.getItem('access_token');
if (!token) {
  alert('로그인이 필요합니다.');
  window.location.href = '/adminlogin.html';
}

let selectedRequest = null;

fetch('/admin/me', {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    document.getElementById('adminName').textContent =
      `${data.admin.name} 관리자`;
    document.getElementById('loginTime').textContent =
      new Date().toLocaleString();
    loadUsers();
  })
  .catch(() => {
    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    localStorage.removeItem('access_token');
    window.location.href = '/adminlogin.html';
  });

async function loadUsers() {
  const res = await fetch('/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = await res.json();
  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';

  users.forEach((user, index) => {
    const row = document.createElement('tr');
    row.classList.add('border-b', 'hoverable-row');
    row.innerHTML = `
      <td class="px-4 py-3">${index + 1}</td>
      <td class="px-4 py-3">${user.name}</td>
      <td class="px-4 py-3">${user.email}</td>
      <td class="px-4 py-3">${user.nickname}</td>
      <td class="px-4 py-3 text-right">
        <button class="bg-blue-500 text-white px-3 py-1 rounded request-btn">보기</button>
      </td>
    `;

    row.querySelector('.request-btn').addEventListener('click', (event) => {
      event.stopPropagation(); // 상세정보 클릭과 충돌 방지
      viewRequests(user._id);
    });

    row.addEventListener('click', () => {
      openUserDetail(user._id);
    });

    tbody.appendChild(row);
  });
}

async function openUserDetail(userId) {
  try {
    const res = await fetch(`/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();

    // 사용자 요약 정보 표시
    document.getElementById('nameText').textContent = user.name;
    document.getElementById('nicknameText').textContent = user.nickname;
    document.getElementById('emailText').textContent = user.email;
    document.getElementById('interestsText').textContent = user.interests;
    document.getElementById('joinDateText').textContent = new Date(
      user.createdAt,
    ).toLocaleDateString();

    // 요청 목록 불러오기
    const reqRes = await fetch(`/user/${userId}/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const requests = await reqRes.json();

    document.getElementById('requestCount').textContent = requests.length;

    const listEl = document.getElementById('userRequestsList');
    listEl.innerHTML = '';

    if (requests.length === 0) {
      listEl.innerHTML = `<li class="p-4 text-gray-500">요청 사항이 없습니다.</li>`;
    } else {
      requests.forEach((r) => {
        const li = document.createElement('li');
        li.className =
          'flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer';
        li.innerHTML = `
          <span>${r.title}</span>
          <span class="text-gray-400">&rarr;</span>
        `;
        listEl.appendChild(li);
      });
    }

    // 화면 전환
    document.getElementById('userListSection').classList.add('hidden');
    document.getElementById('userDetailSection').classList.remove('hidden');
  } catch (err) {
    alert('사용자 정보를 불러오지 못했습니다.');
    console.error(err);
  }
}

function goBackToList() {
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('userListSection').classList.remove('hidden');
}

function closeUserDetail() {
  document.getElementById('userDetailPanel').classList.add('hidden');
}

async function viewRequests(userId) {
  try {
    const res = await fetch(`/user/${userId}/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const requests = await res.json();
    const list = document.getElementById('requestList');
    list.innerHTML = '';

    if (requests.length === 0) {
      list.innerHTML = '<li class="text-gray-500">요청 게시글이 없습니다.</li>';
    } else {
      requests.forEach((r) => {
        const li = document.createElement('li');
        li.className = 'border p-3 rounded shadow-sm';
        li.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">${r.title}</h3>
              <p class="text-sm text-gray-600">${new Date(r.createdAt).toLocaleString()}</p>
              <p>${r.content}</p>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onclick="openPostForm('${userId}', '${r._id}', \`${r.title}\`, \`${r.content}\`)">수락</button>
              <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onclick="deleteRequest('${userId}', '${r._id}')">삭제</button>
            </div>
          </div>
        `;
        list.appendChild(li);
      });
    }

    document.getElementById('requestModal').classList.remove('hidden');
  } catch (e) {
    alert('요청 정보를 불러오는 데 실패했습니다.');
    console.error(e);
  }
}

function closeModal() {
  document.getElementById('requestModal').classList.add('hidden');
}

function openPostForm(userId, requestId, title, content) {
  selectedRequest = { userId, requestId, title, content };
  document.getElementById('postTitle').value = title;
  document.getElementById('postContent').value = content;
  document.getElementById('postModal').classList.remove('hidden');
}

function closePostModal() {
  document.getElementById('postModal').classList.add('hidden');
  selectedRequest = null;
}

async function submitPost() {
  const { userId, requestId } = selectedRequest;
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;

  await fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, userId }),
  });

  await fetch(`/user/${userId}/requests/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  closePostModal();
  closeModal();
  location.reload();
}

async function deleteRequest(userId, requestId) {
  if (!confirm('이 요청을 삭제하시겠습니까?')) return;
  const res = await fetch(`/user/${userId}/requests/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    alert('삭제되었습니다.');
    viewRequests(userId);
  } else {
    const err = await res.json();
    alert(`삭제 실패: ${err.message}`);
  }
}

function showUserList() {
  document.getElementById('userListSection').classList.remove('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('allRequestsSection').classList.add('hidden');
}

function goBackToList() {
  showUserList();
}

function showAllRequests() {
  document.getElementById('userListSection').classList.add('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('allRequestsSection').classList.remove('hidden');
  loadAllRequests();
}

function goBackToList() {
  document.getElementById('userListSection').classList.remove('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('allRequestsSection').classList.add('hidden');
}

async function loadAllRequests() {
  const token = localStorage.getItem('access_token');
  const res = await fetch('/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = await res.json();

  const container = document.getElementById('allRequestsList');
  container.innerHTML = '';

  users.forEach((user) => {
    user.requests?.forEach((r) => {
      const wrapper = document.createElement('div');
      const date = new Date(r.createdAt).toLocaleDateString();
      wrapper.className =
        'bg-white p-4 rounded shadow flex justify-between items-start';

      wrapper.innerHTML = `
        <div>
          <p class="font-bold text-gray-700 mb-1">${r.title}</p>
          <p class="text-sm text-gray-500">${r.content}</p>
          <p class="text-xs text-gray-400 mt-2">${user.nickname} (${user.email})</p>
          <p class="text-xs text-gray-500 mt-1">요청일자: ${date}</p>
        </div>
        <div class="flex gap-2 items-start">
          <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            onclick="openPostForm('${user._id}', '${r._id}', \`${r.title}\`, \`${r.content}\`)">수락</button>
          <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            onclick="deleteRequest('${user._id}', '${r._id}')">삭제</button>
        </div>
      `;
      container.appendChild(wrapper);
    });
  });
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('access_token');
  window.location.href = '/adminlogin.html';
});
