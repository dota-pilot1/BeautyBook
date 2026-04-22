package com.cj.beautybook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BeautyBookServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeautyBookServerApplication.class, args);
	}

}
