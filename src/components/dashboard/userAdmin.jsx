function UserAdmin() {
  return (
    <section className="px-5 md:px-32">
      <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl ">
        Bienvenido
        <span class="text-blue-600 "> Tal tal</span>
      </h1>
      <div class=" mb-6 ">
        <div class="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
          <div class="px-6 pt-6 2xl:container">
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <div class="md:col-span-2 lg:col-span-1">
                <div class="h-full py-3 px-1 space-y-1 rounded-xl border border-gray-200 bg-white">
                  <div class="flex flex-col mt-8">
                    <div class="overflow-x-auto rounded-lg">
                      <div class="align-middle inline-block min-w-full">
                        <div class="shadow overflow-hidden sm:rounded-lg">
                          <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  class="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Transaction
                                </th>
                                <th
                                  scope="col"
                                  class="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Date & Time
                                </th>
                                <th
                                  scope="col"
                                  class="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody class="bg-white">
                              <tr>
                                <td class="p-4 whitespace-nowrap text-sm font-normal text-gray-900">
                                  Payment from{" "}
                                  <span class="font-semibold">
                                    Bonnie Green
                                  </span>
                                </td>
                                <td class="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                                  Apr 23 ,2021
                                </td>
                                <td class="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  $2300
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="md:col-span-2 lg:col-span-1">
                <div class="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
                  <table class="table-auto w-full">
                    <thead>
                      <tr>
                        <th class="px-4 py-2 text-left border-b-2 w-full">
                          <h2 class="text-ml font-bold text-gray-600">
                            Transacciones
                          </h2>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="border-b w-full">
                        <td class="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Comercio</h2>
                            <p>24/07/2023</p>
                          </div>
                        </td>
                        <td class="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>150$</span>
                          </p>
                        </td>
                      </tr>
                      <tr class="border-b w-full">
                        <td class="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Comercio</h2>
                            <p>24/06/2023</p>
                          </div>
                        </td>
                        <td class="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>15$</span>
                          </p>
                        </td>
                      </tr>
                      <tr class="border-b w-full">
                        <td class="px-4 py-2 text-left align-top w-1/2">
                          <div>
                            <h2>Comercio</h2>
                            <p>02/05/2023</p>
                          </div>
                        </td>
                        <td class="px-4 py-2 text-right text-cyan-500 w-1/2">
                          <p>
                            <span>50$</span>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default UserAdmin;
