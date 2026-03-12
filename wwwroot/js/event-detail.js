document.addEventListener('DOMContentLoaded', function () {
    const joinCard = document.querySelector('.ev-join-card');
    const btnJoin = document.getElementById('btnRequestJoin');
    const btnCancel = document.getElementById('btnCancelJoin');

    const eventId = joinCard?.dataset?.eventId;
    const joinMode = joinCard?.dataset?.joinmode;
    const isCapacityFull = joinCard?.dataset?.full === 'true';
    const initialJoined = joinCard?.dataset?.joined === 'true';
    const initialPending = joinCard?.dataset?.pending === 'true';
    const initialRejected = joinCard?.dataset?.rejected === 'true';
    let currentJoinState = initialJoined ? 'joined' : (initialPending ? 'pending' : 'none');

    function setJoinState(state) {
        if (!btnJoin && !btnCancel) return;
        currentJoinState = state;

        const isJoined = state === 'joined';
        const isPending = state === 'pending';

        if (isJoined || isPending) {
            if (btnJoin) {
                btnJoin.disabled = false;
                btnJoin.style.display = 'none';
                btnJoin.onclick = null;
            }
            if (btnCancel) {
                btnCancel.disabled = false;
                btnCancel.style.display = 'block';
                btnCancel.innerText = isPending ? 'Cancel Request' : 'Cancel Participation';
                btnCancel.onclick = handleCancel;
            }
        } else {
            if (btnJoin) {
                btnJoin.disabled = false;
                if (isCapacityFull) {
                    btnJoin.style.display = 'none';
                    btnJoin.onclick = null;
                } else {
                    btnJoin.style.display = 'block';
                    btnJoin.innerText = 'Request to Join';
                    btnJoin.onclick = handleJoin;
                }
            }
            if (btnCancel) {
                btnCancel.disabled = false;
                btnCancel.style.display = 'none';
                btnCancel.onclick = null;
            }
        }
    }

    function handleJoin() {
        if (!btnJoin || btnJoin.disabled) return;
        const previousState = currentJoinState;
        btnJoin.disabled = true;
        btnJoin.innerText = 'Processing...';

        $.ajax({
            url: `/event/join/${eventId}`,
            method: 'POST',
            xhrFields: { withCredentials: true },
            statusCode: {
                401: () => { window.location.href = '/login'; },
                409: () => { alert('This event is already full.'); window.location.reload(); }
            },
            success: () => {
                if (joinMode === 'Private') {
                    if (initialRejected) { window.location.reload(); return; }
                    setJoinState('pending');
                } else {
                    setJoinState('joined');
                }
            },
            error: (xhr) => {
                if (xhr.status !== 401 && xhr.status !== 409) {
                    alert('Failed to join. Please try again.');
                    setJoinState(previousState);
                }
            }
        });
    }

    function handleCancel() {
        if (!btnCancel || btnCancel.disabled) return;
        const previousState = currentJoinState;
        btnCancel.disabled = true;
        btnCancel.innerText = 'Processing...';

        $.ajax({
            url: `/event/join/${eventId}`,
            method: 'DELETE',
            xhrFields: { withCredentials: true },
            success: () => {
                if (!btnJoin) { window.location.reload(); return; }
                setJoinState('none');
            },
            error: (xhr) => {
                if (xhr.status === 401) {
                    window.location.href = '/login';
                } else {
                    alert('Failed to cancel. Please try again.');
                    setJoinState(previousState);
                }
            }
        });
    }

    if ((btnJoin || btnCancel) && eventId) {
        setJoinState(currentJoinState);
    }

    const pageRoot = document.querySelector('.ev-page');
    const isOnlineEvent = pageRoot?.dataset?.eventType === 'online';
    const locBox = document.querySelector('.ev-meta-item:last-child');
    if (locBox && !isOnlineEvent) {
        locBox.style.cursor = 'pointer';
        locBox.addEventListener('click', () => {
            const label = locBox.querySelector('.ev-strong')?.innerText || '';
            const locName = label
                .replace(/\u2197/g, '')
                .replace(/\u00e2\u2020\u2014/g, '')
                .trim();

            if (locName && locName !== 'No Location') {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`, '_blank');
            }
        });
    }

    const mapFrame = document.querySelector('.ev-map iframe');
    if (mapFrame) {
        mapFrame.onload = function () {
            console.log('Map loaded');
        };
    }

    const participantModal = document.getElementById('participantModal');
    const participantModalTrigger = document.getElementById('participantModalTrigger');
    const participantModalClose = document.getElementById('participantModalClose');

    function openParticipantModal() {
        if (!participantModal) return;
        participantModal.classList.add('is-open');
        participantModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('ev-modal-open');
    }

    function closeParticipantModal() {
        if (!participantModal) return;
        participantModal.classList.remove('is-open');
        participantModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('ev-modal-open');
    }

    if (participantModalTrigger) {
        participantModalTrigger.addEventListener('click', openParticipantModal);
        participantModalTrigger.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter' || evt.key === ' ') {
                evt.preventDefault();
                openParticipantModal();
            }
        });
    }

    if (participantModal) {
        participantModal.addEventListener('click', (evt) => {
            if (evt.target === participantModal) {
                closeParticipantModal();
            }
        });
    }

    if (participantModalClose) {
        participantModalClose.addEventListener('click', closeParticipantModal);
    }

    document.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape' && participantModal?.classList.contains('is-open')) {
            closeParticipantModal();
        }
    });
});
