var jsonDataUrl = '../assets_admin/data/appointment.json';


fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            item.doctor_image = `../assets_admin/img/doctors/${item.doctor_image}`;
            item.patient_image = `../assets_admin/img/patients/${item.patient_image}`;
        });
        var table = $('#index_admin_data').DataTable();
        table.destroy();
        $('#index_admin_data').DataTable({
            data: data.slice(0, 5),
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
                        var patientimageHtml = `
                        <h2 class="table-avatar">
                        <a href="profile" class="avatar avatar-sm me-2"><img class="avatar-img rounded-circle" src="${data.patient_image}" alt="User image"></a>
                        <a href="profile"> ${data.patient_name} </a>
                        </h2>
                    `;
                        return patientimageHtml;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var appointmentHtml = `
                        ${data.appointment} <span class="text-primary d-block"> ${data.time}
                    `;
                        return appointmentHtml;
                    }
                },
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

                },
                {
                    data: 'amount' }

            ],
            searching: false,
            info: false,
            paging: false,
            // scrollY: false,
            // scrollX: false,
            order: []
        });


        var table = $('#appointment_data').DataTable();
        table.destroy();
        $('#appointment_data').DataTable({
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
                        var patientimageHtml = `
                        <h2 class="table-avatar">
                        <a href="profile" class="avatar avatar-sm me-2"><img class="avatar-img rounded-circle" src="${data.patient_image}" alt="User image"></a>
                        <a href="profile"> ${data.patient_name} </a>
                        </h2>
                    `;
                        return patientimageHtml;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var appointmentHtml = `
                        ${data.appointment} <span class="text-primary d-block"> ${data.time}
                    `;
                        return appointmentHtml;
                    }
                },
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

                },
                {
                    data: 'amount'}

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
