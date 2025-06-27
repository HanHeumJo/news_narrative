const token = localStorage.getItem('access_token');
if (!token) {
  alert('로그인이 필요합니다.');
  window.location.href = '/adminlogin.html';
}

let selectedRequest = null;

let lastViewedUser = null;

let requestDetailFromAllRequests = false;

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

        li.addEventListener('click', () => {
          showRequestDetail(r, user); // 요청 상세보기 함수 연결
        });

        listEl.appendChild(li);
      });
    }

    // 화면 전환
    document.getElementById('userListSection').classList.add('hidden');
    document.getElementById('userDetailSection').classList.remove('hidden');
    document.getElementById('allRequestsSection').classList.add('hidden');
  } catch (err) {
    alert('사용자 정보를 불러오지 못했습니다.');
    console.error(err);
  }
}

function closeUserDetail() {
  document.getElementById('userDetailPanel').classList.add('hidden');
}

function goBackToUserDetail() {
  if (requestDetailFromAllRequests) {
    document.getElementById('requestDetailSection').classList.add('hidden');
    document.getElementById('allRequestsSection').classList.remove('hidden');
  } else if (lastViewedUser && lastViewedUser._id) {
    document.getElementById('requestDetailSection').classList.add('hidden');
    openUserDetail(lastViewedUser._id); // 내부에서 allRequestsSection 숨김 처리 필요
  } else {
    showUserList();
  }
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

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date)) return '-';
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
}

function showRequestDetail(request, user) {
  lastViewedUser = user;

  requestDetailFromAllRequests =
    document
      .getElementById('allRequestsSection')
      .classList.contains('hidden') === false;

  document.getElementById('detailNickname').textContent = user.nickname || '-';
  document.getElementById('detailEmail').textContent = user.email || '-';
  document.getElementById('detailJoinDate').textContent = formatDate(
    user.createdAt,
  );
  document.getElementById('detailRequestCount').textContent =
    user.requests?.length || 0;

  document.getElementById('detailTitle').textContent = request.title || '-';
  document.getElementById('detailContent').textContent = request.content || '-';

  // 화면 전환
  ['userListSection', 'userDetailSection', 'allRequestsSection'].forEach(
    (id) => {
      document.getElementById(id).classList.add('hidden');
    },
  );
  document.getElementById('requestDetailSection').classList.remove('hidden');
}

function showUserList() {
  document.getElementById('userListSection').classList.remove('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('allRequestsSection').classList.add('hidden');
  document.getElementById('requestDetailSection').classList.add('hidden');
  document.getElementById('postWriteSection').classList.add('hidden');
}

function showAllRequests() {
  document.getElementById('userListSection').classList.add('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('allRequestsSection').classList.remove('hidden');
  document.getElementById('requestDetailSection').classList.add('hidden');
  document.getElementById('postWriteSection').classList.add('hidden');

  fetch('/user', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((users) => {
      const tbody = document.getElementById('allRequestsTableBody');
      tbody.innerHTML = '';

      let index = 1;
      users.forEach((user) => {
        (user.requests || []).forEach((req) => {
          const tr = document.createElement('tr');
          tr.classList.add('hover:bg-gray-100', 'cursor-pointer');

          tr.innerHTML = `
            <td class="px-4 py-3">${index++}</td>
            <td class="px-4 py-3">${req.title}</td>
            <td class="px-4 py-3">${new Date(req.createdAt).toLocaleDateString()}</td>
            <td class="px-4 py-3 text-right"></td>
          `;

          tr.addEventListener('click', () => {
            showRequestDetail(req, user);
          });

          tbody.appendChild(tr);
        });
      });
    });
}

function goBackToList() {
  document.getElementById('userListSection').classList.remove('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('allRequestsSection').classList.add('hidden');
  document.getElementById('userDetailSection').classList.add('hidden');
  document.getElementById('userListSection').classList.remove('hidden');
  showUserList();
}

function showPostWriteSection(request) {
  [
    'userListSection',
    'userDetailSection',
    'allRequestsSection',
    'requestDetailSection',
    'postWriteSection',
  ].forEach((id) => document.getElementById(id).classList.add('hidden'));

  document.getElementById('postWriteSection').classList.remove('hidden');

  document.getElementById('postTitle').value = '';
  document.getElementById('postRequestContent').textContent =
    request.content || '-';
}

function openPostForm(userId, requestId, title, content) {
  selectedRequest = { userId, requestId, title, content };

  // 기존 섹션 숨김
  [
    'userListSection',
    'userDetailSection',
    'allRequestsSection',
    'requestDetailSection',
    'requestModal',
  ].forEach((id) => document.getElementById(id).classList.add('hidden'));

  // 게시글 내용 삽입
  document.getElementById('postTitle').textContent = title;
  document.getElementById('postRequestContent').textContent = content;

  // 사용자 정보는 일단 초기화
  document.getElementById('writeNickname').textContent = '-';
  document.getElementById('writeEmail').textContent = '-';
  document.getElementById('writeJoinDate').textContent = '-';
  document.getElementById('writeRequestCount').textContent = '-';

  // 사용자 정보 불러오기
  fetch(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((user) => {
      document.getElementById('writeNickname').textContent =
        user.nickname || '-';
      document.getElementById('writeEmail').textContent = user.email || '-';
      document.getElementById('writeJoinDate').textContent = formatDate(
        user.createdAt,
      );
      document.getElementById('writeRequestCount').textContent =
        user.requests?.length || 0;
    });

  // 섹션 보이기
  document.getElementById('postWriteSection').classList.remove('hidden');
}

function closePostModal() {
  selectedRequest = null;

  // 게시글 작성 섹션 숨기고 기본 사용자 목록으로 이동
  document.getElementById('postWriteSection').classList.add('hidden');
  showUserList(); // 사용자 목록으로 돌아감
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

function renderAllRequests(users) {
  const list = document.getElementById('allRequestsList');
  list.innerHTML = '';

  users.forEach((user) => {
    (user.requests || []).forEach((req, idx) => {
      const div = document.createElement('div');
      div.className =
        'flex justify-between items-center bg-white p-4 rounded shadow-sm cursor-pointer hover:bg-gray-100';
      div.innerHTML = `
        <div>
          <p class="text-sm font-medium">${idx + 1}. ${req.title}</p>
          <p class="text-xs text-gray-500">${new Date(req.createdAt).toLocaleDateString()}</p>
        </div>
        <span class="text-xl text-gray-400">→</span>
      `;
      div.addEventListener('click', () => showRequestDetail(user, req));
      list.appendChild(div);
    });
  });
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('access_token');
  window.location.href = '/adminlogin.html';
});
