/***js form Morgan***/
/****************************思源API操作**************************/
export async function 设置思源块属性(内容块id, 属性对象) {
  let url = "/api/attr/setBlockAttrs";
  return 解析响应体(
    向思源请求数据(url, {
      id: 内容块id,
      attrs: 属性对象,
    })
  );
}
async function 向思源请求数据(url, data) {
  let resData = null;
  await fetch(url, {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      Authorization: `Token ''`,
    },
  }).then(function (response) {
    resData = response.json();
  });
  return resData;
}
async function 解析响应体(response) {
  let r = await response;
  return r.code === 0 ? r.data : null;
}
