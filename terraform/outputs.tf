output "vps_id" {
  description = "Hostinger VPS ID"
  value       = hostinger_vps.localdelivery.vps_id
}

output "vps_hostname" {
  description = "VPS hostname"
  value       = hostinger_vps.localdelivery.hostname
}

output "vps_ipv4" {
  description = "VPS IPv4 address"
  value       = hostinger_vps.localdelivery.ipv4_address
}

output "vps_status" {
  description = "VPS status"
  value       = hostinger_vps.localdelivery.status
}