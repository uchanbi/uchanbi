%define app_location /usr/local/pearson/app/gloss-web-%{opt_suffix}
Name: pearson-app-gloss-web-%{opt_suffix}
Version: %{opt_version}
Release: %{opt_release}
Group: Pearson
URL: http://www.pearsone.co.uk/
Summary: GLOSS Web application package.
Vendor: Pearson
Packager: Simas Cepaitis
License: Pearson

# Build requirements
Requires: pearson-base
Requires: pearson-node-4.0.0
BuildArch: x86_64
BuildRoot: /var/tmp/%{opt_name}-buildroot


%description
GLOSS Web application package

%prep
:

%build
:

%install
mkdir -p $RPM_BUILD_ROOT/usr/local/pearson/var/log/gloss
mkdir -p $RPM_BUILD_ROOT/%{app_location}
cp -a %{opt_sourcedir}/* $RPM_BUILD_ROOT/%{app_location}/


%clean
rm -rf $RPM_BUILD_ROOT


%files
%defattr(-, gloss, gloss)
%{app_location}
/usr/local/pearson/var/log/gloss



%pre
/usr/sbin/groupadd -g 20016 gloss > /dev/null 2>&1
/usr/sbin/useradd -u 20016 -g 20016 -c "Gloss user" -d %{app_location} \
        -s /bin/false gloss > /dev/null 2>&1
exit 0

%changelog
* Wed Sep 17 2014 Simas Cepaitis <simas.cepaitis@pearson.com>
- Initial version

