// common/config.js — ab全ページ共通の設定値
// GoogleクライアントID・APIエンドポイントをJSでdata-client_id属性に書き戻すだけに留め、
// GSIの初期化方式自体(async defer・宣言的init)には触れない。このscriptタグを
// 各index.htmlの<head>先頭に置くことで、GSIの外部scriptが実際にfetchを開始する
// 時点でこの値が確実に設定済みになるようにしている(タイミングの偶然に頼らない)。
window.AA_API_BASE = "https://ab-board-api.azurewebsites.net/api";
window.AA_GOOGLE_CLIENT_ID = "550466095352-50h92anfullp137l4gq4gdi7ogjk0auc.apps.googleusercontent.com";
