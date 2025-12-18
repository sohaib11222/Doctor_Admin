const Breadcrumb = ({ title, li1, li2 }) => {
  return (
    <div className="page-header" style={{ paddingLeft: '1.875rem' }}>
      <div className="row">
        <div className="col-sm-12">
          <ul className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">{title}</a>
            </li>
            <li className="breadcrumb-item">
              <i className="feather-chevron-right"></i>
            </li>
            <li className="breadcrumb-item active">{li1}</li>
            {li2 && (
              <>
                <li className="breadcrumb-item">
                  <i className="feather-chevron-right"></i>
                </li>
                <li className="breadcrumb-item active">{li2}</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Breadcrumb

