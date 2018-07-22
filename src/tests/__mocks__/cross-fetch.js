const crossFetch = jest.genMockFromModule('cross-fetch');

function fetch(url, {method,body,headers}) {
  // TODO: Fill mocked Promise when required
  // return new Promise((resolve, reject) => {
  //   process.nextTick(
  //    () => (
  //      try {
  //        resolve(
  //           {success: true, message: "mocked success"}
  //        );
  //        } catch(e) {
  //          reject(
  //            { error: "mocked error" }
  //          );
  //        }
  //     )
  //   );
  // });
}
crossFetch.fetch = fetch;
export default crossFetch;
