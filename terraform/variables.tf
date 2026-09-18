variable "hostinger_api_token" {
  description = "Hostinger API token"
  type        = string
  sensitive   = true
}

variable "vps_plan" {
  description = "Hostinger VPS plan"
  type        = string
  default     = "KVM 2"
}

variable "data_center_id" {
  description = "Hostinger VPS data center ID"
  type        = number
  default     = 13
}

variable "template_id" {
  description = "Hostinger VPS template ID"
  type        = number
  default     = 1121
}