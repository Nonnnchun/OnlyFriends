document.addEventListener('DOMContentLoaded', function () {
    const joinCard = document.querySelector('.ev-join-card');
    const btnJoin = document.getElementById('btnRequestJoin');
    const btnCancel = document.getElementById('btnCancelJoin');

    const eventId = joinCard?.dataset?.eventId;
    const storageKey = eventId ? `event_join_request_${eventId}` : 'event_join_request';

    function readRequestedState() {
        try {
            return window.localStorage.getItem(storageKey) === '1';
        } catch (error) {
            console.warn('Cannot read join request state:', error);
            return false;
        }
    }

    function writeRequestedState(requested) {
        try {
            if (requested) {
                window.localStorage.setItem(storageKey, '1');
            } else {
                window.localStorage.removeItem(storageKey);
            }
        } catch (error) {
            console.warn('Cannot save join request state:', error);
        }
    }

    function setJoinButtonsState(requested) {
        if (!btnJoin || !btnCancel) return;

        btnJoin.disabled = false;
        btnCancel.disabled = false;
        btnJoin.innerText = 'Request to Join';
        btnCancel.innerText = 'Cancel Request';

        btnJoin.style.display = requested ? 'none' : 'block';
        btnCancel.style.display = requested ? 'block' : 'none';
    }

    if (btnJoin && btnCancel) {
        setJoinButtonsState(readRequestedState());

        btnJoin.addEventListener('click', function () {
            if (btnJoin.disabled) return;

            btnJoin.disabled = true;
            btnJoin.innerText = 'Processing...';

            setTimeout(() => {
                writeRequestedState(true);
                setJoinButtonsState(true);
                console.log('Join request created');
            }, 700);
        });

        btnCancel.addEventListener('click', function () {
            if (btnCancel.disabled) return;

            btnCancel.disabled = true;
            btnCancel.innerText = 'Processing...';

            setTimeout(() => {
                writeRequestedState(false);
                setJoinButtonsState(false);
                console.log('Join request cancelled');
            }, 700);
        });
    }

    const locBox = document.querySelector('.ev-meta-item:last-child');
    if (locBox) {
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
});
