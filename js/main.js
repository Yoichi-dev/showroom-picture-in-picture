$(function () {
    // PinPフラグ（PinP中のフルスクリーン防止）
    var flg = true;

    // 配信関連
    var hls = new Hls();

    // 配信画面判定
    if ($('#this-room-profile').length == 1) {

        // ビデオ欄を作成
        // PinP 有効
        $('#js-room-video').append('<video id="pinpvideo" width="1" height="1" autoplay></video>');
        // PinP 無効（フルスクリーン）
        $('#js-room-video').append('<video id="fullvideo" width="1" height="1" autoplay disablePictureInPicture></video>');

        // アイコン作成
        // PinP
        $('.room-header-menu ul').prepend('<li><a id="pinpvideobtn" class="icon-pinp" title="ピクチャーインピクチャー" href="#">PinP</a></li>');
        // フルスクリーン
        $('.room-header-menu ul').prepend('<li><a id="fullvideobtn" class="icon-fullscreen" title="全画面" href="#">FullScreen</a></li>');

        // イベントリスナー
        // PinP
        document.getElementById('pinpvideo').addEventListener('leavepictureinpicture', function () {
            document.getElementById('pinpvideo').load();
            $('#room-video-mute-notify').click();
            flg = true;
        });
        document.getElementById('pinpvideo').addEventListener('loadedmetadata', function () {
            document.getElementById('pinpvideo').requestPictureInPicture();
        });
        // フルスクリーン
        document.getElementById('fullvideo').addEventListener('fullscreenchange', function () {
            if (!document.fullscreenElement) {
                document.getElementById('fullvideo').load();
                $('#room-video-mute-notify').click();
            }
        });
        document.getElementById('fullvideo').addEventListener('loadedmetadata', function () {
            document.getElementById('fullvideo').requestFullscreen();
        });

        // 配信取得
        // PinP
        $('#pinpvideobtn').click(function (e) {
            e.preventDefault();
            // PinP中
            if (!flg) return;
            flg = false;
            getStream('pinpvideo');
        });
        // フルスクリーン
        $('#fullvideobtn').click(function (e) {
            e.preventDefault();
            // PinP中
            if (!flg) {
                alert("【拡張機能】\nピクチャーインピクチャーが有効です\n解除してください");
                return;
            }
            getStream('fullvideo');
        });

    }

    // 配信情報取得
    function getStream(id) {
        // デフォルトで音が出ているか確認
        if ("icon-room-volume-on icon-volume-on" === $('#js-room-volume').attr('class')) {
            // 音が出ていたら消す
            $('#room-video-mute-notify').click();
        }

        // 動画情報を取得
        $.ajax({
            url: '/api/live/streaming_url?room_id=' + document.getElementById('this-room-profile').href.split('=')[1],
            type: 'GET',
            timeout: 5000,
        })
            .done(function (data) {
                if (Object.keys(data).length != 0) {
                    var video = document.getElementById(id);
                    var videoSrc = data.streaming_url_list[0].url;
                    if (Hls.isSupported()) {
                        hls.loadSource(videoSrc);
                        hls.attachMedia(video);
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = videoSrc;
                    }
                } else {
                    // 配信停止中
                    flg = true;
                }
            })
            .fail(function () {
                alert("【拡張機能】配信の取得に失敗しました");
            });
    }

});