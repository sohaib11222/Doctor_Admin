var jsonDataUrl = '../assets_admin/data/doctor.json';


fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            item.doctor_image = `../assets_admin/img/doctors/${item.doctor_image}`;
        });

        

        var table = $('#doctor_data').DataTable();
        table.destroy();
        $('#doctor_data').DataTable({
            data: data,
            columns: [
                {
                    data: null,
                    render: function (data, type, row) {
                        var doctorimageHtml = `
              <h2 class="table-avatar">
              <a href="profile" class="avatar avatar-sm me-2"><img class="avatar-img rounded-circle" src="${data.doctor_image}" alt="User image"></a>
              <a href="profile"> ${data.doctor_name} </a>
              </h2>
            `;
                        return doctorimageHtml;
                    }
                },
                { data: 'speciality' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var MemberHtml = `
                        ${data.member_since} <span class="text-primary d-block"> ${data.time}
                    `;
                        return MemberHtml;
                    }
                },
                { data: 'earned' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var statusHtml = `
                        <div class="status-toggle">
                        <input type="checkbox" id="${data.id_status}" class="check" checked>
                        <label for="${data.for_status}" class="checktoggle">${data.status}</label>
                        </div>
                    `;
                        return statusHtml;
                    }

                }
            ],
            paging: true,
            searching: false,
            // scrollY: false,
            // scrollX: false,
            order: []
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
