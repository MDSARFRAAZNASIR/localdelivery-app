terraform {
  required_version = ">= 1.16.0"

  cloud {
    hostname     = "app.terraform.io"
    organization = "localdelivery-devops"

    workspaces {
      name = "localdelivery-infrastructure"
    }
  }

  required_providers {
    hostinger = {
      source  = "hostinger/hostinger"
      version = "~> 0.1.23"
    }
  }
}

provider "hostinger" {
  api_token = var.hostinger_api_token
}

resource "hostinger_vps" "localdelivery" {
  plan           = var.vps_plan
  data_center_id = var.data_center_id
  template_id    = var.template_id
}
