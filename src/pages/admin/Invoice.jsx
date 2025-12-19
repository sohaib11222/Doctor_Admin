const Invoice = () => {
  const items = [
    { id: 1, item: 'medicine1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', unitCost: '$10', qty: 2, total: '$10' },
    { id: 2, item: 'medicine2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', unitCost: '$10', qty: 1, total: '$10' },
    { id: 3, item: 'medicine3', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', unitCost: '$90', qty: 1, total: '$90' },
    { id: 4, item: 'medicine4', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', unitCost: '$70', qty: 1, total: '$70' },
    { id: 5, item: 'medicine5', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', unitCost: '70', qty: 1, total: '$70' },
  ]

  return (
    <>
      <div className="invoice-container">
            <div className="row">
              <div className="col-sm-6 m-b-20">
                <img alt="Logo" className="inv-logo img-fluid" src="/assets_admin/img/logo.png" />
              </div>
              <div className="col-sm-6 m-b-20">
                <div className="invoice-details">
                  <h3 className="text-uppercase">Invoice 20169998</h3>
                  <ul className="list-unstyled mb-0">
                    <li>
                      Date: <span>14-5-2023</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 m-b-20">
                <ul className="list-unstyled mb-0">
                  <li>myDoctor Hospital</li>
                  <li>3864 Quiet Valley Lane,</li>
                  <li>Sherman Oaks, CA, 91403</li>
                  <li>GST No:</li>
                </ul>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-lg-7 col-xl-8 m-b-20">
                <h6>Invoice to</h6>
                <ul className="list-unstyled mb-0">
                  <li>
                    <h5 className="mb-0">
                      <strong>Charlene Reed</strong>
                    </h5>
                  </li>
                  <li>4417 Goosetown Drive</li>
                  <li>Taylorsville, NC, 28681</li>
                  <li>United States</li>
                  <li>8286329170</li>
                  <li>
                    <a href="javascript:;">
                      <span className="__cf_email__" data-cfemail="84e7ece5f6e8e1eae1f6e1e1e0c4e1fce5e9f4e8e1aae7ebe9">
                        [email&#160;protected]
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-sm-6 col-lg-5 col-xl-4 m-b-20">
                <h6>Payment Details</h6>
                <ul className="list-unstyled invoice-payment-details mb-0">
                  <li>
                    <h5>
                      Total Due: <span className="text-end">$200</span>
                    </h5>
                  </li>
                  <li>
                    Bank name: <span>Profit Bank Europe</span>
                  </li>
                  <li>
                    Country: <span>United Kingdom</span>
                  </li>
                  <li>
                    City: <span>London E1 8BF</span>
                  </li>
                  <li>
                    Address: <span>3 Goodman Street</span>
                  </li>
                  <li>
                    IBAN: <span>KFH37784028476740</span>
                  </li>
                  <li>
                    SWIFT code: <span>BPT4E</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ITEM</th>
                    <th className="d-none d-sm-table-cell">DESCRIPTION</th>
                    <th className="text-nowrap">UNIT COST</th>
                    <th>QTY</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.item}</td>
                      <td className="d-none d-sm-table-cell">{item.description}</td>
                      <td>{item.unitCost}</td>
                      <td>{item.qty}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="row invoice-payment">
                <div className="col-sm-7"></div>
                <div className="col-sm-5">
                  <div className="m-b-20">
                    <h6 className="mt-3 ms-2">Total due</h6>
                    <div className="table-responsive no-border">
                      <table className="table mb-0">
                        <tbody>
                          <tr>
                            <th>Subtotal:</th>
                            <td className="text-center">$250</td>
                          </tr>
                          <tr>
                            <th>
                              Tax: <span className="text-regular">(25%)</span>
                            </th>
                            <td className="text-center">$50</td>
                          </tr>
                          <tr>
                            <th>Total:</th>
                            <td className="text-center text-primary">
                              <h5>$200</h5>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice-info">
                <h5>Other information</h5>
                <p className="text-muted mb-0">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed dictum ligula, cursus blandit risus.
                  Maecenas eget metus non tellus dignissim aliquam ut a ex. Maecenas sed vehicula dui, ac suscipit lacus. Sed
                  finibus leo vitae lorem interdum, eu scelerisque tellus fermentum. Curabitur sit amet lacinia lorem. Nullam
                  finibus pellentesque libero.
                </p>
              </div>
            </div>
          </div>
    </>
  )
}

export default Invoice

